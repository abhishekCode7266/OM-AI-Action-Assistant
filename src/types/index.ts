export type AIModeType =
  | 'general'
  | 'coding'
  | 'data-analyst'
  | 'research'
  | 'writing'
  | 'study'
  | 'career'
  | 'project-builder';

export interface AIModeConfig {
  id: AIModeType;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  systemPrompt: string;
  suggestedPrompts: string[];
}

export type Role = 'user' | 'assistant' | 'system';

export type VoiceState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'ERROR';

export type ActionStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface ActionStep {
  id: string;
  type: 'think' | 'plan' | 'act' | 'achieve';
  title: string;
  description?: string;
  status: ActionStepStatus;
  timestamp: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'camera_snapshot' | 'screen_snapshot' | 'data';
  mimeType: string;
  size: number;
  dataUrl?: string; // base64 or object URL
  textExtract?: string;
  uploadedAt: number;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
  score?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  createdAt: number;
  mode?: AIModeType;
  attachments?: Attachment[];
  actionSteps?: ActionStep[];
  sources?: SearchSource[];
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: AIModeType;
  isPinned?: boolean;
  isArchived?: boolean;
  previewText?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
}

export interface DatasetColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  nullCount: number;
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
}

export interface DatasetSummary {
  name: string;
  rowCount: number;
  columnCount: number;
  columns: DatasetColumn[];
  previewRows: Record<string, any>[];
  insights: string[];
}

export type AIProviderId = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'ollama';

export interface ProviderStatus {
  id: AIProviderId;
  name: string;
  isConfigured: boolean;
  models: string[];
  defaultModel: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  activeProvider: AIProviderId;
  activeModel: string;
  customApiKeys: Partial<Record<AIProviderId, string>>;
  customEndpoint?: string;
  // Voice
  voiceName: string;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  autoSpeakResponse: boolean;
  // Chat
  enterToSend: boolean;
  autoScroll: boolean;
  messageDensity: 'compact' | 'comfortable';
  streamResponses: boolean;
}
