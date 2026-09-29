import { AIProvider, ChatRequestOptions, StreamCallbacks } from '../types';

export class GroqProvider implements AIProvider {
  id = 'groq';
  name = 'Groq (Ultra-fast)';
  models = [
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ];
  defaultModel = 'llama-3.1-70b-versatile';

  isConfigured(customKey?: string): boolean {
    return Boolean(customKey || process.env.GROQ_API_KEY);
  }

  async streamChat(options: ChatRequestOptions, callbacks: StreamCallbacks): Promise<void> {
    const apiKey = options.apiKey || process.env.GROQ_API_KEY;
    if (!apiKey) {
      const err = new Error(
        'Groq API key is not configured. Please add GROQ_API_KEY to your .env file or enter your API key in Settings.'
      );
      callbacks.onError(err);
      return;
    }

    const modelName = options.model || this.defaultModel;
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    try {
      const messages: any[] = [];
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }

      for (const msg of options.messages) {
        let content = msg.content;
        if (msg.attachments && msg.attachments.length > 0) {
          const filesSummary = msg.attachments
            .filter((a) => a.textExtract)
            .map((a) => `[File: ${a.name}]:\n${a.textExtract}`)
            .join('\n\n');
          if (filesSummary) {
            content += `\n\n${filesSummary}`;
          }
        }
        messages.push({ role: msg.role, content });
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
          temperature: options.temperature ?? 0.6,
        }),
        signal: options.abortSignal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errText}`);
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
            } catch (e) {}
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
        onChunk: (chunk) => (result += chunk),
        onComplete: (text) => resolve(text || result),
        onError: (err) => reject(err),
      });
    });
  }
}
