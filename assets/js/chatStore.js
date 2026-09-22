/**
 * OM AI Assistant - Chat & Memory Store
 * Manages multi-chat histories, chronological grouping, search, auto-naming, and cross-chat memory.
 */

class OMChatStore {
  constructor() {
    this.STORAGE_KEY = 'om_conversations_v3';
    this.ACTIVE_CHAT_KEY = 'om_active_chat_id';
    this.MEMORY_KEY = 'om_user_memory_v1';
    this.SETTINGS_KEY = 'om_settings_v2';
    
    this.chats = this.loadChats();
    this.activeChatId = localStorage.getItem(this.ACTIVE_CHAT_KEY) || null;
    this.memory = this.loadMemory();
    this.settings = this.loadSettings();

    // Ensure at least one active chat exists
    if (!this.activeChatId || !this.getChat(this.activeChatId)) {
      if (this.chats.length > 0) {
        this.activeChatId = this.chats[0].id;
      } else {
        const newChat = this.createChat("New Chat");
        this.activeChatId = newChat.id;
      }
      localStorage.setItem(this.ACTIVE_CHAT_KEY, this.activeChatId);
    }
  }

  loadChats() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Failed to parse chats from localStorage, initializing fresh store", e);
      return [];
    }
  }

  saveChats() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.chats));
    } catch (e) {
      console.error("Error saving chats to localStorage", e);
    }
  }

  loadMemory() {
    try {
      const data = localStorage.getItem(this.MEMORY_KEY);
      return data ? JSON.parse(data) : {
        enabled: true,
        facts: [
          { id: 'mem-1', text: "Preferred programming languages: Python, JavaScript, React", created: Date.now() },
          { id: 'mem-2', text: "Target work style: High-velocity, modular, Think-Plan-Act-Achieve", created: Date.now() }
        ]
      };
    } catch (e) {
      return { enabled: true, facts: [] };
    }
  }

  saveMemory() {
    try {
      localStorage.setItem(this.MEMORY_KEY, JSON.stringify(this.memory));
    } catch (e) {}
  }

  loadSettings() {
    const DEFAULT_PROMPT = `You are OM AI Assistant, a highly efficient, smart, and versatile personal AI collaborator.
Core Directives:
1. Tone & Style: Be warm, engaging, concise, and direct. Avoid unnecessary fluff or lengthy robotic pleasantries. Get straight to the user's solution.
2. Accuracy & Formatting: Organize responses using clean Markdown, bullet points, and bold text for scannability. Show step-by-step breakdowns for complex tasks, coding, or problem-solving.
3. Problem Solving: Always aim to provide actionable, practical solutions. If critical context is missing, briefly ask targeted follow-up questions.
4. Adaptability: Mirror the user's technical proficiency, scale explanations to their needs, and maintain safety and accuracy across all topics.`;

    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      const parsed = data ? JSON.parse(data) : {};
      return {
        apiKey: localStorage.getItem('om_custom_provider_key') || parsed.apiKey || '',
        model: parsed.model || 'gemini-2.0-flash',
        autoSpeech: parsed.autoSpeech !== undefined ? parsed.autoSpeech : false,
        voiceRate: parsed.voiceRate || 1.0,
        voicePitch: parsed.voicePitch || 1.0,
        userPlan: localStorage.getItem('om_user_plan') || parsed.userPlan || 'ultimate_developer',
        isDeveloper: localStorage.getItem('om_dev_mode') !== 'false',
        developerTier: 'Ultimate Lifetime Access (Free)',
        systemPrompt: parsed.systemPrompt || DEFAULT_PROMPT,
        theme: 'dark'
      };
    } catch (e) {
      return {
        apiKey: '',
        model: 'gemini-2.0-flash',
        autoSpeech: false,
        voiceRate: 1.0,
        voicePitch: 1.0,
        userPlan: 'ultimate_developer',
        isDeveloper: true,
        developerTier: 'Ultimate Lifetime Access (Free)',
        systemPrompt: DEFAULT_PROMPT,
        theme: 'dark'
      };
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
    if (newSettings.apiKey !== undefined) {
      localStorage.setItem('om_custom_provider_key', newSettings.apiKey);
    }
    if (newSettings.userPlan !== undefined) {
      localStorage.setItem('om_user_plan', newSettings.userPlan);
    }
    if (newSettings.isDeveloper !== undefined) {
      localStorage.setItem('om_dev_mode', newSettings.isDeveloper ? 'true' : 'false');
    }
  }

  isDeveloper() {
    return this.settings.isDeveloper || this.settings.userPlan === 'ultimate_developer';
  }

  getUserPlan() {
    return this.settings.userPlan || 'ultimate_developer';
  }

  activateDeveloperMode() {
    this.saveSettings({
      isDeveloper: true,
      userPlan: 'ultimate_developer',
      developerTier: 'Ultimate Lifetime Access (Free)'
    });
    return true;
  }

  createChat(title = "New Chat", mode = "general", projectId = null) {
    const id = 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newChat = {
      id,
      title,
      mode,
      projectId,
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      files: []
    };
    this.chats.unshift(newChat);
    this.activeChatId = id;
    localStorage.setItem(this.ACTIVE_CHAT_KEY, id);
    this.saveChats();
    return newChat;
  }

  getChat(id) {
    return this.chats.find(c => c.id === id) || null;
  }

  getActiveChat() {
    return this.getChat(this.activeChatId);
  }

  setActiveChat(id) {
    if (this.getChat(id)) {
      this.activeChatId = id;
      localStorage.setItem(this.ACTIVE_CHAT_KEY, id);
      return true;
    }
    return false;
  }

  addMessage(chatId, message) {
    const chat = this.getChat(chatId);
    if (!chat) return null;

    const fullMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...message
    };

    chat.messages.push(fullMsg);
    chat.updatedAt = Date.now();

    // Auto-generate title from first user prompt if still default
    if (message.sender === 'user' && (chat.title === 'New Chat' || chat.title.startsWith('Chat #'))) {
      chat.title = this.generateSmartTitle(message.text);
    }

    this.saveChats();
    return fullMsg;
  }

  generateSmartTitle(text) {
    if (!text) return "Conversation";
    let clean = text.replace(/^(explain|write|create|build|how to|can you|help me with|analyze)\s+/i, '').trim();
    if (!clean) clean = text.trim();
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    const words = clean.split(/\s+/).slice(0, 5).join(' ');
    return words.length > 38 ? words.substring(0, 35) + '...' : words;
  }

  updateChatTitle(chatId, newTitle) {
    const chat = this.getChat(chatId);
    if (chat && newTitle.trim()) {
      chat.title = newTitle.trim();
      chat.updatedAt = Date.now();
      this.saveChats();
      return true;
    }
    return false;
  }

  togglePinChat(chatId) {
    const chat = this.getChat(chatId);
    if (chat) {
      chat.pinned = !chat.pinned;
      this.saveChats();
      return chat.pinned;
    }
    return false;
  }

  deleteChat(chatId) {
    const idx = this.chats.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      this.chats.splice(idx, 1);
      if (this.activeChatId === chatId) {
        if (this.chats.length > 0) {
          this.activeChatId = this.chats[0].id;
        } else {
          const fresh = this.createChat("New Chat");
          this.activeChatId = fresh.id;
        }
        localStorage.setItem(this.ACTIVE_CHAT_KEY, this.activeChatId);
      }
      this.saveChats();
      return true;
    }
    return false;
  }

  clearAllChats() {
    this.chats = [];
    const fresh = this.createChat("New Chat");
    this.activeChatId = fresh.id;
    this.saveChats();
    return fresh;
  }

  getGroupedChats(query = '') {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    let filtered = this.chats;
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.messages.some(m => m.text && m.text.toLowerCase().includes(q))
      );
    }

    const pinned = [];
    const today = [];
    const yesterday = [];
    const previous7Days = [];
    const older = [];

    filtered.forEach(chat => {
      if (chat.pinned) {
        pinned.push(chat);
        return;
      }
      const age = now - chat.updatedAt;
      if (age < oneDay) {
        today.push(chat);
      } else if (age < 2 * oneDay) {
        yesterday.push(chat);
      } else if (age < sevenDays) {
        previous7Days.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { pinned, today, yesterday, previous7Days, older };
  }

  // Memory operations
  addMemoryFact(text) {
    if (!text || !text.trim()) return null;
    const fact = {
      id: 'mem_' + Date.now(),
      text: text.trim(),
      created: Date.now()
    };
    this.memory.facts.push(fact);
    this.saveMemory();
    return fact;
  }

  deleteMemoryFact(factId) {
    this.memory.facts = this.memory.facts.filter(f => f.id !== factId);
    this.saveMemory();
  }

  toggleMemoryEnabled(enabled) {
    this.memory.enabled = enabled;
    this.saveMemory();
  }

  clearAllMemory() {
    this.memory.facts = [];
    this.saveMemory();
  }

  exportChatAsMarkdown(chatId) {
    const chat = this.getChat(chatId);
    if (!chat) return "";

    let md = `# ${chat.title}\n`;
    md += `*Exported from OM AI Assistant (${new Date().toLocaleString()})*\n`;
    md += `*Tagline: Think. Plan. Act. Achieve.*\n\n---\n\n`;

    chat.messages.forEach(m => {
      const role = m.sender === 'user' ? '👤 User' : '🤖 OM Assistant';
      md += `### ${role} (${m.timestamp})\n\n${m.text}\n\n`;
      if (m.actions && m.actions.length > 0) {
        md += `#### Tasks & Action Items:\n`;
        m.actions.forEach(a => {
          md += `- [ ] [${a.stage ? a.stage.toUpperCase() : 'ACT'}] ${a.title} (${a.estimate || '1d'})\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    return md;
  }
}

// Global instance
window.omChatStore = new OMChatStore();
