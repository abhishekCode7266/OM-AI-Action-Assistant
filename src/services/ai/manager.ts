import { AIProviderId, ProviderStatus } from '@/types';
import { AIProvider, ChatRequestOptions, StreamCallbacks } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GroqProvider } from './providers/groq';
import { OllamaProvider } from './providers/ollama';

class ProviderManager {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.register(new GeminiProvider());
    this.register(new OpenAIProvider());
    this.register(new AnthropicProvider());
    this.register(new GroqProvider());
    this.register(new OllamaProvider());
  }

  register(provider: AIProvider) {
    this.providers.set(provider.id, provider);
  }

  get(id: string): AIProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`AI Provider "${id}" is not registered.`);
    }
    return provider;
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getStatuses(customKeys: Partial<Record<AIProviderId, string>> = {}): ProviderStatus[] {
    return this.getAll().map((p) => ({
      id: p.id as AIProviderId,
      name: p.name,
      models: p.models,
      defaultModel: p.defaultModel,
      isConfigured: p.isConfigured(customKeys[p.id as AIProviderId]),
    }));
  }

  async streamChat(providerId: string, options: ChatRequestOptions, callbacks: StreamCallbacks): Promise<void> {
    const provider = this.get(providerId);
    return provider.streamChat(options, callbacks);
  }
}

export const aiProviderManager = new ProviderManager();
