/**
 * OM AI Assistant - Main Application Controller
 * Wires together ChatGPT-inspired multi-chat UI, Sidebar, Voice, Analytics, Projects, and Modals.
 */

class OMApp {
  constructor() {
    this.chatStore = window.omChatStore;
    this.assistant = window.omAssistant;
    this.voice = window.omVoice;
    this.analytics = window.omAnalytics;
    this.fileManager = window.omFileManager;
    this.projects = window.omProjects;

    this.searchQuery = '';
    this.editingMsgIndex = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderSidebar();
    this.renderChatMessages();
    this.updateHeaderInfo();
    this.hideLoadingScreen();
  }

  hideLoadingScreen() {
    const loader = document.getElementById('om-loading-screen');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => loader.remove(), 400);
      }, 500);
    }
  }

  setupEventListeners() {
    // New Chat Button
    document.querySelectorAll('.btn-new-chat').forEach(btn => {
      btn.addEventListener('click', () => this.handleNewChat());
    });

    // Sidebar Toggle (Mobile & Desktop)
    const toggleBtn = document.getElementById('btn-sidebar-toggle');
    const sidebar = document.getElementById('om-sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    const mobileMenuBtn = document.getElementById('btn-mobile-menu');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Search Chats
    const searchInput = document.getElementById('sidebar-chat-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderSidebar();
      });
    }

    // Chat Message Input & Send
    const sendBtn = document.getElementById('btn-chat-send');
    const inputField = document.getElementById('chat-user-input');

    if (sendBtn && inputField) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());

      inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });

      // Auto-resize input textarea
      inputField.addEventListener('input', () => {
        inputField.style.height = 'auto';
        inputField.style.height = Math.min(inputField.scrollHeight, 180) + 'px';
      });
    }

    // Voice Dictation Button
    const voiceBtn = document.getElementById('btn-voice-input');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (this.voice) this.voice.toggleRecording();
      });
    }

    // File Upload Trigger
    const fileInput = document.getElementById('hidden-file-input');
    const attachBtn = document.getElementById('btn-attach-file');
    if (attachBtn && fileInput) {
      attachBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          await this.fileManager.processFile(file);
        }
        fileInput.value = '';
        this.renderAttachmentPreviews();
      });
    }

    // Image Upload Trigger
    const imageInput = document.getElementById('hidden-image-input');
    const imageBtn = document.getElementById('btn-attach-image');
    if (imageBtn && imageInput) {
      imageBtn.addEventListener('click', () => imageInput.click());
      imageInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          await this.fileManager.processFile(file);
        }
        imageInput.value = '';
        this.renderAttachmentPreviews();
      });
    }

    // Mode Selector Dropdown
    const modeSelect = document.getElementById('chat-mode-selector');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        const newMode = e.target.value;
        this.assistant.setMode(newMode);
        this.showToast(`Switched to ${newMode.toUpperCase()} Mode`, 'info');
      });
    }

    // Settings Modal Triggers
    document.querySelectorAll('.btn-open-settings').forEach(btn => {
      btn.addEventListener('click', () => this.openSettingsModal());
    });

    // Close Modals
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.om-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Export Chat Button
    const exportBtn = document.getElementById('btn-export-chat');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportCurrentChat());
    }

    // Clear Chat Messages Button
    const clearBtn = document.getElementById('btn-clear-chat');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const active = this.chatStore.getActiveChat();
        if (active) {
          active.messages = [];
          this.chatStore.saveChats();
          this.renderChatMessages();
          this.showToast('Conversation cleared', 'info');
        }
      });
    }

    // Setup Settings Save
    this.setupSettingsHandlers();
  }

  handleNewChat(mode = 'general') {
    const newChat = this.chatStore.createChat("New Chat", mode);
    this.fileManager.clearPendingFiles();
    this.renderAttachmentPreviews();
    this.renderSidebar();
    this.renderChatMessages();
    this.updateHeaderInfo();

    const input = document.getElementById('chat-user-input');
    if (input) input.focus();

    // Close mobile drawer if open
    const sidebar = document.getElementById('om-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
  }

  async handleSendMessage() {
    const input = document.getElementById('chat-user-input');
    if (!input || this.assistant.isProcessing) return;

    const text = input.value.trim();
    const attachments = [...this.fileManager.pendingFiles];

    if (!text && attachments.length === 0) return;

    input.value = '';
    input.style.height = 'auto';

    // Clear attachments dock
    this.fileManager.clearPendingFiles();
    this.renderAttachmentPreviews();

    const activeChat = this.chatStore.getActiveChat();
    if (!activeChat) return;

    // Add User Message to Store
    const userMsg = this.chatStore.addMessage(activeChat.id, {
      sender: 'user',
      text: text,
      attachments: attachments.map(a => ({ name: a.name, size: a.size, isImage: a.isImage, previewUrl: a.previewUrl }))
    });

    this.renderSidebar(); // update title
    this.renderChatMessages();
    this.updateHeaderInfo();

    // Show Typing Indicator
    this.renderTypingIndicator();

    try {
      // Process through Cognitive Engine
      const assistantResponse = await this.assistant.processUserMessage(text, attachments);
      this.removeTypingIndicator();

      if (assistantResponse) {
        this.chatStore.addMessage(activeChat.id, assistantResponse);
        this.renderChatMessages();
        this.renderSidebar();

        // Optional auto-speech read-out
        if (this.chatStore.settings.autoSpeech && this.voice) {
          this.voice.speakText(assistantResponse.text, assistantResponse.id);
        }
      }
    } catch (err) {
      this.removeTypingIndicator();
      this.chatStore.addMessage(activeChat.id, {
        sender: 'om',
        text: "I encountered an issue synthesizing the action vector. Please check your network or API settings.",
        verified: false
      });
      this.renderChatMessages();
    }
  }

  renderSidebar() {
    const container = document.getElementById('sidebar-history-container');
    if (!container) return;

    const grouped = this.chatStore.getGroupedChats(this.searchQuery);
    const activeId = this.chatStore.activeChatId;

    let html = '';

    const renderGroup = (label, list) => {
      if (list.length === 0) return '';
      let groupHtml = `<div class="sidebar-group-title">${label}</div><div class="sidebar-chat-list">`;
      list.forEach(chat => {
        const isActive = chat.id === activeId;
        const modeIcon = this.getModeIcon(chat.mode);
        groupHtml += `
          <div class="sidebar-chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
            <span class="chat-item-icon">${modeIcon}</span>
            <span class="chat-item-title" title="${this.escapeHTML(chat.title)}">${this.escapeHTML(chat.title)}</span>
            <div class="chat-item-actions">
              <button class="chat-action-btn" onclick="event.stopPropagation(); window.omApp.promptRenameChat('${chat.id}')" title="Rename">✏️</button>
              <button class="chat-action-btn" onclick="event.stopPropagation(); window.omApp.deleteChat('${chat.id}')" title="Delete">🗑️</button>
            </div>
          </div>
        `;
      });
      groupHtml += `</div>`;
      return groupHtml;
    };

    if (grouped.pinned.length > 0) html += renderGroup('📌 Pinned Chats', grouped.pinned);
    if (grouped.today.length > 0) html += renderGroup('Today', grouped.today);
    if (grouped.yesterday.length > 0) html += renderGroup('Yesterday', grouped.yesterday);
    if (grouped.previous7Days.length > 0) html += renderGroup('Previous 7 Days', grouped.previous7Days);
    if (grouped.older.length > 0) html += renderGroup('Older', grouped.older);

    if (!html) {
      html = `<div style="text-align: center; padding: 2rem 1rem; color: var(--om-text-muted); font-size: 0.8rem;">No conversations found</div>`;
    }

    container.innerHTML = html;

    // Attach click listeners to select chat
    container.querySelectorAll('.sidebar-chat-item').forEach(item => {
      item.addEventListener('click', () => {
        const chatId = item.getAttribute('data-chat-id');
        this.chatStore.setActiveChat(chatId);
        this.renderSidebar();
        this.renderChatMessages();
        this.updateHeaderInfo();

        const sidebar = document.getElementById('om-sidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');
      });
    });
  }

  renderChatMessages() {
    const container = document.getElementById('chat-messages-container');
    const welcomeScreen = document.getElementById('om-welcome-screen');
    if (!container) return;

    const activeChat = this.chatStore.getActiveChat();
    if (!activeChat || activeChat.messages.length === 0) {
      container.innerHTML = '';
      if (welcomeScreen) welcomeScreen.style.display = 'flex';
      return;
    }

    if (welcomeScreen) welcomeScreen.style.display = 'none';

    let html = '';
    activeChat.messages.forEach(msg => {
      if (msg.sender === 'user') {
        html += this.renderUserMessage(msg);
      } else {
        html += this.renderAssistantMessage(msg);
      }
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  renderUserMessage(msg) {
    let attachmentsHtml = '';
    if (msg.attachments && msg.attachments.length > 0) {
      attachmentsHtml = '<div class="msg-attachments-row">';
      msg.attachments.forEach(att => {
        if (att.isImage && att.previewUrl) {
          attachmentsHtml += `<img src="${att.previewUrl}" class="msg-img-preview" alt="${att.name}">`;
        } else {
          attachmentsHtml += `<span class="msg-file-pill">📎 ${this.escapeHTML(att.name)}</span>`;
        }
      });
      attachmentsHtml += '</div>';
    }

    return `
      <div class="chat-msg user-msg" id="${msg.id}">
        <div class="msg-content">
          ${attachmentsHtml}
          <div class="user-text">${this.escapeHTML(msg.text)}</div>
          <div class="msg-meta-actions">
            <span>${msg.timestamp || ''}</span>
            <button class="msg-action-link" onclick="window.omApp.editUserMessage('${msg.id}')">Edit</button>
            <button class="msg-action-link" onclick="window.omApp.copyText('${this.escapeHTML(msg.text)}')">Copy</button>
          </div>
        </div>
        <div class="msg-avatar user-avatar">👤</div>
      </div>
    `;
  }

  renderAssistantMessage(msg) {
    const formattedText = this.assistant.formatMarkdown(msg.text);

    // Collapsible Think-Plan-Act-Verify trace
    let reasoningHtml = '';
    if (msg.reasoning) {
      reasoningHtml = `
        <details class="om-thinking-trace">
          <summary>
            <span class="pulse-dot"></span>
            <span>OM Cognitive Trace (Think ➔ Plan ➔ Act ➔ Verify)</span>
          </summary>
          <div class="trace-content">
            <pre>${this.escapeHTML(msg.reasoning)}</pre>
          </div>
        </details>
      `;
    }

    // Inline SVG chart if dataset present
    let chartHtml = '';
    if (msg.chartDataset && window.omAnalytics) {
      chartHtml = window.omAnalytics.renderInlineChartSVG(msg.chartDataset);
    }

    // Task Checklist
    let tasksHtml = '';
    if (msg.actions && msg.actions.length > 0) {
      tasksHtml = `
        <div class="om-tasks-card">
          <div class="tasks-card-header">
            <span style="font-weight: 700; color: #fff; font-size: 0.85rem;">📋 Action Items & Execution Milestones</span>
            <button class="om-btn om-btn-xs om-btn-primary" onclick="window.omApp.pushAllTasksToPlanner('${msg.id}')">
              ⚡ Push All to Task Planner
            </button>
          </div>
          <div class="tasks-checklist">
      `;
      msg.actions.forEach((act, idx) => {
        const stageBadge = act.stage ? act.stage.toUpperCase() : 'ACT';
        tasksHtml += `
          <div class="task-checkbox-item">
            <input type="checkbox" id="chk_${msg.id}_${idx}">
            <label for="chk_${msg.id}_${idx}">
              <span class="stage-tag stage-${act.stage}">${stageBadge}</span>
              <span>${this.escapeHTML(act.title)}</span>
              <span class="task-est">(${act.estimate || '1d'})</span>
            </label>
          </div>
        `;
      });
      tasksHtml += `</div></div>`;
    }

    return `
      <div class="chat-msg assistant-msg" id="${msg.id}">
        <div class="msg-avatar om-avatar">
          <img src="assets/icons/logo.svg" alt="OM" style="width: 22px; height: 22px;">
        </div>
        <div class="msg-body">
          <div class="assistant-header-row">
            <span class="om-name">OM Assistant</span>
            <span class="om-brand-tag">Think. Plan. Act. Achieve.</span>
            ${msg.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
          </div>

          ${reasoningHtml}

          <div class="assistant-markdown-text">
            ${formattedText}
          </div>

          ${chartHtml}
          ${tasksHtml}

          <div class="msg-footer-toolbar">
            <button class="msg-tool-btn" onclick="window.omApp.copyText(\`${this.escapeQuote(msg.text)}\`)">📋 Copy</button>
            <button class="msg-tool-btn" data-tts-id="${msg.id}" onclick="window.omVoice.speakText(\`${this.escapeQuote(msg.text)}\`, '${msg.id}')">🔊 Listen</button>
            <button class="msg-tool-btn" onclick="window.omApp.regenerateLastResponse()">🔄 Regenerate</button>
          </div>
        </div>
      </div>
    `;
  }

  renderTypingIndicator() {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    this.removeTypingIndicator();

    const indicator = document.createElement('div');
    indicator.id = 'om-active-thinking-node';
    indicator.className = 'chat-msg assistant-msg thinking-indicator';
    indicator.innerHTML = `
      <div class="msg-avatar om-avatar">
        <img src="assets/icons/logo.svg" alt="OM" style="width: 22px; height: 22px;">
      </div>
      <div class="msg-body">
        <div style="display: flex; align-items: center; gap: 8px; font-family: var(--om-font-mono); font-size: 0.8rem; color: var(--om-cyan);">
          <span class="pulse-dot"></span>
          <span>OM is thinking, planning and formulating answer...</span>
        </div>
      </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  }

  removeTypingIndicator() {
    const node = document.getElementById('om-active-thinking-node');
    if (node) node.remove();
  }

  renderAttachmentPreviews() {
    const container = document.getElementById('attachment-preview-dock');
    if (!container) return;

    const files = this.fileManager.pendingFiles;
    if (files.length === 0) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    let html = '';
    files.forEach(f => {
      html += `
        <div class="attachment-chip">
          <span>${f.isImage ? '🖼️' : '📎'} ${this.escapeHTML(f.name)} (${this.fileManager.formatSize(f.size)})</span>
          <button class="remove-att-btn" onclick="window.omApp.removeAttachment('${f.id}')">✕</button>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  removeAttachment(fileId) {
    this.fileManager.removePendingFile(fileId);
    this.renderAttachmentPreviews();
  }

  updateHeaderInfo() {
    const activeChat = this.chatStore.getActiveChat();
    const titleEl = document.getElementById('chat-header-title');
    const modeSelect = document.getElementById('chat-mode-selector');

    if (activeChat) {
      if (titleEl) titleEl.textContent = activeChat.title;
      if (modeSelect) modeSelect.value = activeChat.mode || 'general';
    }
  }

  updateModeSelector(mode) {
    const modeSelect = document.getElementById('chat-mode-selector');
    if (modeSelect) modeSelect.value = mode;
  }

  promptRenameChat(chatId) {
    const chat = this.chatStore.getChat(chatId);
    if (!chat) return;
    const newName = prompt("Rename conversation:", chat.title);
    if (newName && newName.trim()) {
      this.chatStore.updateChatTitle(chatId, newName.trim());
      this.renderSidebar();
      this.updateHeaderInfo();
    }
  }

  deleteChat(chatId) {
    if (confirm("Delete this conversation?")) {
      this.chatStore.deleteChat(chatId);
      this.renderSidebar();
      this.renderChatMessages();
      this.updateHeaderInfo();
    }
  }

  editUserMessage(msgId) {
    const active = this.chatStore.getActiveChat();
    if (!active) return;
    const msg = active.messages.find(m => m.id === msgId);
    if (msg) {
      const input = document.getElementById('chat-user-input');
      if (input) {
        input.value = msg.text;
        input.focus();
      }
    }
  }

  regenerateLastResponse() {
    const active = this.chatStore.getActiveChat();
    if (!active || active.messages.length === 0) return;

    // Find last user message
    let lastUserMsg = null;
    for (let i = active.messages.length - 1; i >= 0; i--) {
      if (active.messages[i].sender === 'user') {
        lastUserMsg = active.messages[i];
        break;
      }
    }

    if (lastUserMsg) {
      // Remove last assistant message if present
      if (active.messages[active.messages.length - 1].sender === 'om') {
        active.messages.pop();
        this.chatStore.saveChats();
        this.renderChatMessages();
      }

      this.renderTypingIndicator();
      this.assistant.processUserMessage(lastUserMsg.text, []).then(resp => {
        this.removeTypingIndicator();
        if (resp) {
          this.chatStore.addMessage(active.id, resp);
          this.renderChatMessages();
        }
      });
    }
  }

  pushAllTasksToPlanner(msgId) {
    const active = this.chatStore.getActiveChat();
    if (!active) return;
    const msg = active.messages.find(m => m.id === msgId);
    if (!msg || !msg.actions) return;

    let count = 0;
    msg.actions.forEach(a => {
      if (window.omPlanner) {
        window.omPlanner.addTask({
          title: a.title,
          stage: a.stage || 'act',
          priority: 'high',
          estimate: a.estimate || '1d',
          desc: `Created from conversation: ${active.title}`
        });
        count++;
      }
    });

    this.showToast(`Pushed ${count} action tasks into Task Planner!`, 'success');
  }

  exportCurrentChat() {
    const active = this.chatStore.getActiveChat();
    if (!active) return;

    const md = this.chatStore.exportChatAsMarkdown(active.id);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${active.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Chat exported as Markdown file', 'success');
  }

  copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Copied to clipboard!', 'success');
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('om-toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = `om-toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    const settings = this.chatStore.settings;
    const keyInput = document.getElementById('settings-gemini-key-input');
    const modelSelect = document.getElementById('settings-model-select');
    const promptInput = document.getElementById('settings-system-prompt');
    const autoSpeechCheck = document.getElementById('settings-auto-speech-chk');

    if (keyInput) keyInput.value = settings.apiKey || '';
    if (modelSelect) modelSelect.value = settings.model || 'gemini-1.5-flash';
    if (promptInput) promptInput.value = settings.systemPrompt || '';
    if (autoSpeechCheck) autoSpeechCheck.checked = !!settings.autoSpeech;

    this.renderMemoryFactsList();
    modal.classList.add('active');
  }

  renderMemoryFactsList() {
    const container = document.getElementById('settings-memory-facts-list');
    if (!container) return;

    const mem = this.chatStore.memory;
    const toggle = document.getElementById('settings-memory-enabled-chk');
    if (toggle) toggle.checked = mem.enabled;

    if (!mem.facts || mem.facts.length === 0) {
      container.innerHTML = '<div style="color: var(--om-text-muted); font-size: 0.75rem;">No memory facts recorded yet.</div>';
      return;
    }

    let html = '';
    mem.facts.forEach(f => {
      html += `
        <div class="memory-fact-item">
          <span>• ${this.escapeHTML(f.text)}</span>
          <button class="delete-fact-btn" onclick="window.omApp.deleteMemoryFact('${f.id}')">✕</button>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  deleteMemoryFact(factId) {
    this.chatStore.deleteMemoryFact(factId);
    this.renderMemoryFactsList();
    this.showToast('Memory item removed', 'info');
  }

  setupSettingsHandlers() {
    const saveBtn = document.getElementById('btn-save-settings');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const keyInput = document.getElementById('settings-gemini-key-input');
        const modelSelect = document.getElementById('settings-model-select');
        const promptInput = document.getElementById('settings-system-prompt');
        const autoSpeechCheck = document.getElementById('settings-auto-speech-chk');
        const memToggle = document.getElementById('settings-memory-enabled-chk');

        this.chatStore.saveSettings({
          apiKey: keyInput ? keyInput.value.trim() : '',
          model: modelSelect ? modelSelect.value : 'gemini-1.5-flash',
          systemPrompt: promptInput ? promptInput.value : '',
          autoSpeech: autoSpeechCheck ? autoSpeechCheck.checked : false
        });

        if (memToggle) {
          this.chatStore.toggleMemoryEnabled(memToggle.checked);
        }

        const modal = document.getElementById('settings-modal');
        if (modal) modal.classList.remove('active');

        this.showToast('Settings saved successfully!', 'success');
      });
    }

    // Add Memory Fact Button
    const addMemBtn = document.getElementById('btn-add-memory-fact');
    const memInput = document.getElementById('settings-new-memory-input');
    if (addMemBtn && memInput) {
      addMemBtn.addEventListener('click', () => {
        const val = memInput.value.trim();
        if (val) {
          this.chatStore.addMemoryFact(val);
          memInput.value = '';
          this.renderMemoryFactsList();
        }
      });
    }
  }

  getModeIcon(mode) {
    const icons = {
      general: '💬',
      coding: '💻',
      data: '📊',
      research: '🔎',
      writing: '📝',
      project: '🚀',
      career: '💼',
      study: '🎓'
    };
    return icons[mode] || '💬';
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  escapeQuote(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.omApp = new OMApp();
});
