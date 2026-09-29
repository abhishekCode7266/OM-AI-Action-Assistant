import { ActionStep, AIModeType, Attachment, Message } from '@/types';

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onActionStep?: (step: ActionStep) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

export interface ChatRequestOptions {
  messages: Message[];
  mode: AIModeType;
  systemPrompt?: string;
  attachments?: Attachment[];
  model?: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  abortSignal?: AbortSignal;
}

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  defaultModel: string;
  isConfigured: (customKey?: string) => boolean;
  streamChat: (options: ChatRequestOptions, callbacks: StreamCallbacks) => Promise<void>;
  generateText: (options: ChatRequestOptions) => Promise<string>;
}
