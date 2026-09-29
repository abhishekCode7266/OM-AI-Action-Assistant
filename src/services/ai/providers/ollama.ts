import { AIProvider, ChatRequestOptions, StreamCallbacks } from '../types';

export class OllamaProvider implements AIProvider {
  id = 'ollama';
  name = 'Ollama (Local)';
  models = ['llama3', 'mistral', 'codellama', 'llava'];
  defaultModel = 'llama3';

  isConfigured(): boolean {
    return true; // Local endpoint can always be attempted
  }

  async streamChat(options: ChatRequestOptions, callbacks: StreamCallbacks): Promise<void> {
    const baseUrl = options.endpoint || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    const modelName = options.model || this.defaultModel;
    const url = `${baseUrl}/api/chat`;

    try {
      const messages: any[] = [];
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }

      for (const msg of options.messages) {
        const item: any = { role: msg.role, content: msg.content };
        if (msg.attachments && msg.attachments.length > 0) {
          const images = msg.attachments
            .filter((a) => a.dataUrl && (a.type === 'image' || a.type === 'camera_snapshot' || a.type === 'screen_snapshot'))
            .map((a) => a.dataUrl!.split(',')[1] || a.dataUrl!);
          if (images.length > 0) {
            item.images = images;
          }
        }
        messages.push(item);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          messages,
          stream: true,
        }),
        signal: options.abortSignal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `Ollama connection error (${response.status}): Make sure Ollama is running locally at ${baseUrl}. Details: ${errText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is empty');
      const decoder = new TextDecoder();
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
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.message?.content) {
              fullText += parsed.message.content;
              callbacks.onChunk(parsed.message.content);
            }
          } catch (e) {}
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
        onChunk: (chunk) => (result += chunk),
        onComplete: (text) => resolve(text || result),
        onError: (err) => reject(err),
      });
    });
  }
}
