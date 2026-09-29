import { AIProvider, ChatRequestOptions, StreamCallbacks } from '../types';

export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI (GPT-4o)';
  models = ['gpt-4o', 'gpt-4o-mini', 'o1-mini', 'gpt-4-turbo'];
  defaultModel = 'gpt-4o';

  isConfigured(customKey?: string): boolean {
    return Boolean(customKey || process.env.OPENAI_API_KEY);
  }

  async streamChat(options: ChatRequestOptions, callbacks: StreamCallbacks): Promise<void> {
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const err = new Error(
        'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file or enter your API key in Settings.'
      );
      callbacks.onError(err);
      return;
    }

    const modelName = options.model || this.defaultModel;
    const url = 'https://api.openai.com/v1/chat/completions';

    try {
      const messages: any[] = [];

      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }

      for (const msg of options.messages) {
        if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
          const contentParts: any[] = [];
          if (msg.content) {
            contentParts.push({ type: 'text', text: msg.content });
          }

          for (const att of msg.attachments) {
            if (att.dataUrl && (att.type === 'image' || att.type === 'camera_snapshot' || att.type === 'screen_snapshot')) {
              contentParts.push({
                type: 'image_url',
                image_url: { url: att.dataUrl },
              });
            } else if (att.textExtract) {
              contentParts.push({
                type: 'text',
                text: `\n[ATTACHED FILE: ${att.name}]\n${att.textExtract}\n`,
              });
            }
          }

          messages.push({ role: 'user', content: contentParts });
        } else {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          stream: true,
          temperature: options.temperature ?? 0.7,
        }),
        signal: options.abortSignal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errText}`);
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
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                callbacks.onChunk(delta);
              }
            } catch (e) {
              // skip non-json
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
