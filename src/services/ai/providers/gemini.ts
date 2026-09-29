import { AIProvider, ChatRequestOptions, StreamCallbacks } from '../types';

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini';
  models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];
  defaultModel = 'gemini-1.5-flash';

  isConfigured(customKey?: string): boolean {
    return Boolean(customKey || process.env.GEMINI_API_KEY);
  }

  async streamChat(options: ChatRequestOptions, callbacks: StreamCallbacks): Promise<void> {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const err = new Error(
        'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file or enter your API key in Settings.'
      );
      callbacks.onError(err);
      return;
    }

    const modelName = options.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

    try {
      const contents: any[] = [];

      // Prepend system prompt if provided
      if (options.systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `[SYSTEM INSTRUCTIONS]: ${options.systemPrompt}` }],
        });
        contents.push({
          role: 'model',
          parts: [{ text: 'Understood. I will strictly follow these instructions and personas.' }],
        });
      }

      // Convert conversation messages
      for (const msg of options.messages) {
        const parts: any[] = [];

        // Attachments if user message
        if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
          for (const att of msg.attachments) {
            if (att.dataUrl && (att.type === 'image' || att.type === 'camera_snapshot' || att.type === 'screen_snapshot')) {
              const base64Data = att.dataUrl.split(',')[1] || att.dataUrl;
              parts.push({
                inlineData: {
                  mimeType: att.mimeType || 'image/jpeg',
                  data: base64Data,
                },
              });
            } else if (att.textExtract) {
              parts.push({
                text: `[ATTACHED FILE: ${att.name}]:\n${att.textExtract}`,
              });
            }
          }
        }

        if (msg.content) {
          parts.push({ text: msg.content });
        }

        if (parts.length > 0) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts,
          });
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
        signal: options.abortSignal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const candidates = parsed.candidates || [];
              if (candidates.length > 0 && candidates[0].content?.parts) {
                for (const part of candidates[0].content.parts) {
                  if (part.text) {
                    fullText += part.text;
                    callbacks.onChunk(part.text);
                  }
                }
              }
            } catch (e) {
              // Ignore non-json lines
            }
          }
        }
      }

      callbacks.onComplete(fullText);
    } catch (err: any) {
      callbacks.onError(err);
    }
  }

  async generateText(options: ChatRequestOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      let result = '';
      this.streamChat(options, {
        onChunk: (chunk) => {
          result += chunk;
        },
        onComplete: (text) => resolve(text || result),
        onError: (err) => reject(err),
      });
    });
  }
}
