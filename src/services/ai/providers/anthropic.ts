import { AIProvider, ChatRequestOptions, StreamCallbacks } from '../types';

export class AnthropicProvider implements AIProvider {
  id = 'anthropic';
  name = 'Anthropic Claude';
  models = ['claude-3-5-sonnet-20240620', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'];
  defaultModel = 'claude-3-5-sonnet-20240620';

  isConfigured(customKey?: string): boolean {
    return Boolean(customKey || process.env.ANTHROPIC_API_KEY);
  }

  async streamChat(options: ChatRequestOptions, callbacks: StreamCallbacks): Promise<void> {
    const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const err = new Error(
        'Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your .env file or enter your API key in Settings.'
      );
      callbacks.onError(err);
      return;
    }

    const modelName = options.model || this.defaultModel;
    const url = 'https://api.anthropic.com/v1/messages';

    try {
      const messages: any[] = [];

      for (const msg of options.messages) {
        if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
          const contentParts: any[] = [];
          for (const att of msg.attachments) {
            if (att.dataUrl && (att.type === 'image' || att.type === 'camera_snapshot' || att.type === 'screen_snapshot')) {
              const [header, base64] = att.dataUrl.split(';base64,');
              const mediaType = header.replace('data:', '') || 'image/jpeg';
              contentParts.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64 || att.dataUrl,
                },
              });
            } else if (att.textExtract) {
              contentParts.push({
                type: 'text',
                text: `[ATTACHED FILE: ${att.name}]\n${att.textExtract}\n`,
              });
            }
          }
          if (msg.content) {
            contentParts.push({ type: 'text', text: msg.content });
          }
          messages.push({ role: 'user', content: contentParts });
        } else {
          messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelName,
          system: options.systemPrompt,
          messages,
          max_tokens: 4096,
          stream: true,
        }),
        signal: options.abortSignal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${errText}`);
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
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullText += parsed.delta.text;
                callbacks.onChunk(parsed.delta.text);
              }
            } catch (e) {
              // Ignore
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
