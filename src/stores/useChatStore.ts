import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActionStep, AIModeType, Attachment, Conversation, Message } from '@/types';

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  activeConversationId: string | null;
  activeMode: AIModeType;
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
  currentActions: ActionStep[];
  pendingAttachments: Attachment[];
  searchQuery: string;

  // Actions
  createNewConversation: (mode?: AIModeType, initialTitle?: string) => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  togglePinConversation: (id: string) => void;
  setActiveMode: (mode: AIModeType) => void;
  setSearchQuery: (query: string) => void;

  // Messaging
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'createdAt' | 'conversationId'>) => Message;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;

  // Streaming
  startStreaming: (conversationId: string, messageId: string) => void;
  appendStreamChunk: (chunk: string) => void;
  finishStreaming: () => void;

  // Action Steps (Think -> Plan -> Act -> Achieve)
  setActionSteps: (steps: ActionStep[]) => void;
  addActionStep: (step: ActionStep) => void;
  updateActionStep: (id: string, updates: Partial<ActionStep>) => void;
  clearActionSteps: () => void;

  // Attachments
  addPendingAttachment: (attachment: Attachment) => void;
  removePendingAttachment: (id: string) => void;
  clearPendingAttachments: () => void;

  // Management
  clearAllConversations: () => void;
}

const DEFAULT_CONVERSATION_ID = 'conv-welcome';
const DEFAULT_CONVERSATION: Conversation = {
  id: DEFAULT_CONVERSATION_ID,
  title: 'Welcome to OM AI Assistant',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  mode: 'general',
  isPinned: true,
  previewText: 'Hello! I am OM, your next-generation multimodal personal AI assistant.',
};

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'msg-welcome',
  conversationId: DEFAULT_CONVERSATION_ID,
  role: 'assistant',
  content: `# Welcome to OM AI Assistant 👋
*Think. Talk. See. Act. Achieve.*

I am your next-generation personal AI assistant, combining **conversational intelligence**, **voice mode**, **camera vision**, **screen sharing**, **file analysis**, **code execution sandboxes**, **data analytics**, and **dedicated workspaces**.

### How you can interact with me:
- 💬 **Natural Chat**: Type questions, brainstorm, debug code, or draft documents.
- 🎙️ **Voice Mode**: Speak naturally with real-time audio visualization, auto-detection, and interruption support.
- 📷 **Camera Vision**: Show me objects, diagrams, documents, or real-world issues.
- 🖥️ **Screen Sharing**: Let me see your active window or desktop to guide workflows or debug errors.
- 📁 **File & Data Analysis**: Drag and drop CSVs, JSON, code files, or documents for deep insights.
- 🛠️ **Workspaces**: Toggle between **Chat**, **Code Workspace**, **Data Analyst**, and **Notebook**.

*How can I help you achieve your goals today?*`,
  createdAt: Date.now(),
  mode: 'general',
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [DEFAULT_CONVERSATION],
      messages: {
        [DEFAULT_CONVERSATION_ID]: [DEFAULT_WELCOME_MESSAGE],
      },
      activeConversationId: DEFAULT_CONVERSATION_ID,
      activeMode: 'general',
      isStreaming: false,
      streamingMessageId: null,
      streamingContent: '',
      currentActions: [],
      pendingAttachments: [],
      searchQuery: '',

      createNewConversation: (mode = 'general', initialTitle = 'New Chat') => {
        const id = 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        const newConv: Conversation = {
          id,
          title: initialTitle,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          mode,
          previewText: 'New conversation started',
        };

        set((state) => ({
          conversations: [newConv, ...state.conversations],
          messages: {
            ...state.messages,
            [id]: [],
          },
          activeConversationId: id,
          activeMode: mode,
          currentActions: [],
          pendingAttachments: [],
        }));

        return id;
      },

      selectConversation: (id: string) => {
        const conv = get().conversations.find((c) => c.id === id);
        set({
          activeConversationId: id,
          activeMode: conv?.mode || 'general',
          isStreaming: false,
          streamingMessageId: null,
          streamingContent: '',
          currentActions: [],
          pendingAttachments: [],
        });
      },

      deleteConversation: (id: string) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          const nextActive = filtered.length > 0 ? filtered[0].id : null;
          const { [id]: _, ...remainingMessages } = state.messages;
          return {
            conversations: filtered,
            messages: remainingMessages,
            activeConversationId: nextActive,
          };
        });
      },

      renameConversation: (id: string, title: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        }));
      },

      togglePinConversation: (id: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned, updatedAt: Date.now() } : c
          ),
        }));
      },

      setActiveMode: (activeMode: AIModeType) => {
        set((state) => {
          if (!state.activeConversationId) return { activeMode };
          return {
            activeMode,
            conversations: state.conversations.map((c) =>
              c.id === state.activeConversationId ? { ...c, mode: activeMode } : c
            ),
          };
        });
      },

      setSearchQuery: (searchQuery: string) => set({ searchQuery }),

      addMessage: (conversationId, messageData) => {
        const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        const newMessage: Message = {
          ...messageData,
          id,
          conversationId,
          createdAt: Date.now(),
        };

        set((state) => {
          const convMessages = state.messages[conversationId] || [];
          const updatedConversations = state.conversations.map((c) => {
            if (c.id === conversationId) {
              const preview =
                messageData.content.slice(0, 80) +
                (messageData.content.length > 80 ? '...' : '');
              return {
                ...c,
                updatedAt: Date.now(),
                previewText: preview,
                title:
                  c.title === 'New Chat' && messageData.role === 'user'
                    ? messageData.content.slice(0, 36).trim() || 'New Chat'
                    : c.title,
              };
            }
            return c;
          });

          return {
            messages: {
              ...state.messages,
              [conversationId]: [...convMessages, newMessage],
            },
            conversations: updatedConversations,
          };
        });

        return newMessage;
      },

      updateMessage: (conversationId, messageId, updates) => {
        set((state) => {
          const list = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: list.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
            },
          };
        });
      },

      deleteMessage: (conversationId, messageId) => {
        set((state) => {
          const list = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: list.filter((m) => m.id !== messageId),
            },
          };
        });
      },

      startStreaming: (conversationId, messageId) => {
        set({
          isStreaming: true,
          streamingMessageId: messageId,
          streamingContent: '',
        });
      },

      appendStreamChunk: (chunk: string) => {
        set((state) => {
          const newContent = state.streamingContent + chunk;
          if (state.streamingMessageId && state.activeConversationId) {
            const list = state.messages[state.activeConversationId] || [];
            return {
              streamingContent: newContent,
              messages: {
                ...state.messages,
                [state.activeConversationId]: list.map((m) =>
                  m.id === state.streamingMessageId ? { ...m, content: newContent } : m
                ),
              },
            };
          }
          return { streamingContent: newContent };
        });
      },

      finishStreaming: () => {
        set({
          isStreaming: false,
          streamingMessageId: null,
          streamingContent: '',
        });
      },

      setActionSteps: (currentActions) => set({ currentActions }),

      addActionStep: (step) =>
        set((state) => ({ currentActions: [...state.currentActions, step] })),

      updateActionStep: (id, updates) =>
        set((state) => ({
          currentActions: state.currentActions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      clearActionSteps: () => set({ currentActions: [] }),

      addPendingAttachment: (att) =>
        set((state) => ({ pendingAttachments: [...state.pendingAttachments, att] })),

      removePendingAttachment: (id) =>
        set((state) => ({
          pendingAttachments: state.pendingAttachments.filter((a) => a.id !== id),
        })),

      clearPendingAttachments: () => set({ pendingAttachments: [] }),

      clearAllConversations: () =>
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          currentActions: [],
          pendingAttachments: [],
        }),
    }),
    {
      name: 'om-assistant-chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        activeConversationId: state.activeConversationId,
        activeMode: state.activeMode,
      }),
    }
  )
);
