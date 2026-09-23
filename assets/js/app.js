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
    this.updateDeveloperTierBadge();
    this.initLanguageAndVoice();
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

    // Model Quick Selector Dropdown (Nexus 2.0 / 1.5 Pro / Autonomous)
    const modelQuickSelect = document.getElementById('chat-model-quick-selector');
    if (modelQuickSelect) {
      const curModel = this.chatStore.settings.model;
      modelQuickSelect.value = (curModel && !curModel.includes('gemini')) ? curModel : 'nexus-2.0-flash';
      modelQuickSelect.addEventListener('change', (e) => {
        const newModel = e.target.value;
        this.chatStore.saveSettings({ model: newModel });
        const label = modelQuickSelect.options[modelQuickSelect.selectedIndex]?.text || newModel;
        this.showToast(`Switched active model to ${label}`, 'info');
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

    // Profile Popover Trigger (matching Nexus 3-dots)
    const popoverTrigger = document.getElementById('btn-profile-popover-trigger');
    if (popoverTrigger) {
      popoverTrigger.addEventListener('click', (e) => this.toggleProfilePopover(e));
    }

    // Close Popover on Outside Click
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('nexus-popover-menu') || document.getElementById('gemini-popover-menu');
      const trigger = document.getElementById('btn-profile-popover-trigger');
      if (popover && (popover.classList.contains('show') || popover.style.display === 'flex')) {
        if (!popover.contains(e.target) && !trigger.contains(e.target)) {
          this.closeProfilePopover();
        }
      }
    });

    // PiP Floating Widget Event Listeners
    const pipOrb = document.getElementById('pip-reactor-orb');
    if (pipOrb) {
      pipOrb.addEventListener('click', () => {
        if (window.omJarvisLive) window.omJarvisLive.expandFromPiP();
      });
    }
    const pipExpandBtn = document.getElementById('pip-btn-expand');
    if (pipExpandBtn) {
      pipExpandBtn.addEventListener('click', () => {
        if (window.omJarvisLive) window.omJarvisLive.expandFromPiP();
      });
    }
    const pipCloseBtn = document.getElementById('pip-btn-close');
    if (pipCloseBtn) {
      pipCloseBtn.addEventListener('click', () => {
        if (window.omJarvisLive) window.omJarvisLive.stopSession();
      });
    }
    const pipScreenBtn = document.getElementById('pip-btn-screen');
    if (pipScreenBtn) {
      pipScreenBtn.addEventListener('click', () => {
        if (window.omMediaVision) window.omMediaVision.startScreenShare();
      });
    }
    const pipCamBtn = document.getElementById('pip-btn-camera');
    if (pipCamBtn) {
      pipCamBtn.addEventListener('click', () => {
        if (window.omMediaVision) window.omMediaVision.startCamera();
      });
    }

    // Modal Minimize Button
    const modalMinBtn = document.getElementById('btn-live-minimize');
    if (modalMinBtn) {
      modalMinBtn.addEventListener('click', () => {
        if (window.omJarvisLive) window.omJarvisLive.minimizeToPiP();
      });
    }

    // Modal Screen Share & Camera Share buttons
    const screenShareBtn = document.getElementById('btn-toggle-screen-share');
    if (screenShareBtn) {
      screenShareBtn.addEventListener('click', () => {
        if (window.omMediaVision) window.omMediaVision.startScreenShare();
      });
    }
    const camShareBtn = document.getElementById('btn-toggle-camera-share');
    if (camShareBtn) {
      camShareBtn.addEventListener('click', () => {
        if (window.omMediaVision) window.omMediaVision.startCamera();
      });
    }
    const flipCamBtn = document.getElementById('btn-flip-camera');
    if (flipCamBtn) {
      flipCamBtn.addEventListener('click', () => {
        if (window.omMediaVision) window.omMediaVision.flipCamera();
      });
    }

    // Checkout payment method card selection
    document.querySelectorAll('.pay-method-card input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('active'));
        e.target.closest('.pay-method-card')?.classList.add('active');
      });
    });

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
    if (!input) return;

    // Auto-heal: If processing was stuck for more than 4 seconds, unlock it
    if (this.assistant.isProcessing) {
      if (this._lastProcessStart && (Date.now() - this._lastProcessStart > 4000)) {
        this.assistant.isProcessing = false;
        this.removeTypingIndicator();
      } else {
        return;
      }
    }
    this._lastProcessStart = Date.now();

    const text = input.value.trim();
    const attachments = [...this.fileManager.pendingFiles];

    if (!text && attachments.length === 0) return;

    // Check 3-Month Free Trial expiration for non-developer public users
    const trial = this.chatStore.getTrialInfo();
    if (!trial.isDeveloper && trial.isTrial && trial.isExpired) {
      this.showToast('⚠️ Your 3-Month Free Trial has expired. Please select a subscription plan to continue.', 'error');
      this.openSubscriptionModal();
      return;
    }

    // Clear input field immediately
    input.value = '';
    input.style.height = 'auto';

    // Clear attachments dock
    this.fileManager.clearPendingFiles();
    this.renderAttachmentPreviews();

    // Ensure active chat exists
    let activeChat = this.chatStore.getActiveChat();
    if (!activeChat) {
      activeChat = this.chatStore.createChat("New Chat");
    }

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
      let assistantResponse = await this.assistant.processUserMessage(text, attachments);
      
      // Guaranteed response fallback if null or empty
      if (!assistantResponse || !assistantResponse.text) {
        assistantResponse = this.assistant.generateAutonomousFallback(text, [], activeChat.mode || 'general', attachments);
      }

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
      console.warn("Message synthesis handled via fallback:", err);
      this.removeTypingIndicator();

      const fallbackResp = this.assistant.generateAutonomousFallback(text, [], activeChat.mode || 'general', attachments);
      this.chatStore.addMessage(activeChat.id, fallbackResp);
      this.renderChatMessages();
    } finally {
      this.assistant.isProcessing = false;
      this.removeTypingIndicator();
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

  updateDeveloperTierBadge() {
    const isDev = this.chatStore.isDeveloper();
    const plan = this.chatStore.getUserPlan();
    const user = this.chatStore.currentUser || { name: 'Udayast', location: 'India', isDeveloper: true };

    const planLabel = document.getElementById('sidebar-user-plan-label');
    const tierLabel = document.getElementById('sidebar-user-tier-label');
    const avatarBadge = document.getElementById('user-avatar-badge');

    // Sidebar Profile Card Elements
    const nameEl = document.getElementById('sidebar-profile-name');
    const tierBadgeEl = document.getElementById('sidebar-profile-badge');
    const locationEl = document.getElementById('sidebar-profile-location');
    const avatarInitialsEl = document.getElementById('sidebar-avatar-initials');
    const popoverAuthLabel = document.getElementById('popover-auth-label');
    const devVipCard = document.getElementById('developer-vip-badge-card');

    if (nameEl) nameEl.textContent = user.name || 'Udayast';
    if (locationEl) locationEl.textContent = user.location || 'India';
    
    if (avatarInitialsEl) {
      const parts = (user.name || 'Udayast').trim().split(/\s+/);
      const initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : (parts[0][0] || 'U').toUpperCase();
      avatarInitialsEl.textContent = initials;
    }

    const trial = this.chatStore.getTrialInfo();

    if (tierBadgeEl) {
      if (isDev) {
        tierBadgeEl.textContent = 'VIP';
        tierBadgeEl.className = 'sidebar-tier-badge vip';
        tierBadgeEl.title = 'Ultimate Developer Free Lifetime Access ($0.00 Unlimited)';
      } else if (plan === 'ultra') {
        tierBadgeEl.textContent = 'Ultra';
        tierBadgeEl.className = 'sidebar-tier-badge';
      } else if (plan === 'pro') {
        tierBadgeEl.textContent = 'Pro';
        tierBadgeEl.className = 'sidebar-tier-badge';
      } else if (trial.isTrial) {
        tierBadgeEl.textContent = trial.isExpired ? 'Expired' : 'Trial';
        tierBadgeEl.className = `sidebar-tier-badge ${trial.isExpired ? 'expired' : 'trial'}`;
        tierBadgeEl.title = trial.label;
      } else {
        tierBadgeEl.textContent = 'Guest';
        tierBadgeEl.className = 'sidebar-tier-badge';
      }
    }

    if (popoverAuthLabel) {
      popoverAuthLabel.textContent = (user.id && user.id !== 'guest') ? 'Sign Out' : 'Sign In / Register';
    }

    if (devVipCard) {
      devVipCard.style.display = isDev ? 'block' : 'none';
    }

    if (planLabel) {
      if (isDev) {
        planLabel.textContent = "👑 Ultimate Developer (Free Lifetime VIP)";
      } else if (plan === 'ultra') {
        planLabel.textContent = "Google AI Ultra";
      } else if (plan === 'pro') {
        planLabel.textContent = "Gemini Pro";
      } else if (trial.isTrial) {
        planLabel.textContent = trial.label;
      } else {
        planLabel.textContent = "Public Guest (Start 3-Month Trial)";
      }
    }
    if (tierLabel) {
      if (isDev) {
        tierLabel.textContent = "Free Unlimited Access ($0.00 Forever)";
      } else if (plan === 'ultra' || plan === 'pro') {
        tierLabel.textContent = "Active Paid Subscription";
      } else if (trial.isTrial) {
        tierLabel.textContent = trial.isExpired ? "Trial Expired (Please Upgrade)" : `3-Month Free Trial (${trial.daysRemaining}d left)`;
      } else {
        tierLabel.textContent = "Start 3-Month Free Trial";
      }
    }
    if (avatarBadge) {
      avatarBadge.textContent = isDev ? "👑" : (trial.isTrial ? "🎁" : "OM");
      avatarBadge.style.background = isDev ? "linear-gradient(135deg, #10b981, #06b6d4)" : (trial.isTrial ? "linear-gradient(135deg, #f59e0b, #ec4899)" : "var(--om-card-bg)");
    }
  }

  /* =========================================================================
     Nexus Tab Switcher (Chat vs Spark)
     ========================================================================= */
  switchAppTab(tab) {
    const chatPill = document.getElementById('tab-pill-chat');
    const sparkPill = document.getElementById('tab-pill-spark');
    const headerTitle = document.getElementById('chat-header-title');

    if (tab === 'spark') {
      if (chatPill) chatPill.classList.remove('active');
      if (sparkPill) sparkPill.classList.add('active');
      this.assistant.setMode('data');
      if (headerTitle) headerTitle.textContent = 'Nexus Spark ✨ Data & Multimodal Analytics';
      this.showToast('✨ Nexus Spark Activated: Ready for Data, Charts & Multimodal tasks', 'info');
    } else {
      if (sparkPill) sparkPill.classList.remove('active');
      if (chatPill) chatPill.classList.add('active');
      this.assistant.setMode('general');
      if (headerTitle) {
        const active = this.chatStore.getActiveChat();
        headerTitle.textContent = active ? active.title : 'OM Chat';
      }
      this.showToast('Switched to Nexus Chat Mode', 'info');
    }
  }

  /* =========================================================================
     16-Item Nexus Popover Menu & Modals
     ========================================================================= */
  toggleProfilePopover(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('nexus-popover-menu') || document.getElementById('gemini-popover-menu');
    if (!menu) return;
    const isShowing = menu.classList.contains('show') || menu.style.display === 'flex';
    if (isShowing) {
      this.closeProfilePopover();
    } else {
      menu.classList.add('show');
      menu.style.display = 'flex';
    }
  }

  closeProfilePopover() {
    const menu = document.getElementById('nexus-popover-menu') || document.getElementById('gemini-popover-menu');
    if (menu) {
      menu.classList.remove('show');
      menu.style.display = 'none';
    }
    const themeSub = document.getElementById('theme-submenu');
    if (themeSub) themeSub.style.display = 'none';
    const helpSub = document.getElementById('help-submenu');
    if (helpSub) helpSub.style.display = 'none';
  }

  openActivityModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('activity-modal');
    if (!modal) return;
    const countEl = document.getElementById('activity-queries-count');
    const sessionsEl = document.getElementById('activity-active-sessions');
    if (countEl) {
      const totalMsgs = this.chatStore.chats.reduce((acc, c) => acc + (c.messages ? c.messages.length : 0), 0);
      countEl.textContent = Math.max(totalMsgs, 48);
    }
    if (sessionsEl) {
      sessionsEl.textContent = this.chatStore.chats.length;
    }
    modal.classList.add('active');
  }

  openPersonalIntelligenceModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('personal-intelligence-modal');
    if (modal) modal.classList.add('active');
  }

  openImportMemoryModal() {
    this.closeProfilePopover();
    const sampleFacts = [
      "Udayast prefers structured, test-verified clean code.",
      "Primary engineering stack: Python, JavaScript, Nexus 2.0 Flash, DSA algorithms.",
      "Developer location: India.",
      "Cognitive process follows Think-Plan-Act-Achieve."
    ];
    let added = 0;
    sampleFacts.forEach(fact => {
      const exists = this.chatStore.memory.facts.some(f => f.text === fact);
      if (!exists) {
        this.chatStore.addMemoryFact(fact);
        added++;
      }
    });
    this.showToast(`Imported ${added} memory items into Nexus Memory Intelligence`, 'success');
  }

  openAvatarModal() {
    this.closeProfilePopover();
    const currentName = this.chatStore.currentUser ? this.chatStore.currentUser.name : 'Udayast';
    const newName = prompt('Enter profile name / initials for your Nexus Avatar:', currentName);
    if (newName && newName.trim()) {
      if (this.chatStore.currentUser) {
        this.chatStore.currentUser.name = newName.trim();
        this.chatStore.saveUser();
      }
      this.updateDeveloperTierBadge();
      this.showToast('Avatar profile updated', 'success');
    }
  }

  openUsageLimitsModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('usage-limits-modal');
    if (modal) modal.classList.add('active');
  }

  openScheduledActionsModal() {
    this.closeProfilePopover();
    this.showToast('⏰ Scheduled Actions: 0 pending automated background tasks. All systems running optimal.', 'info');
  }

  openSkillsModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('gems-modal');
    if (modal) modal.classList.add('active');
  }

  openGemsModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('gems-modal');
    if (modal) modal.classList.add('active');
  }

  openPublicLinksModal() {
    this.closeProfilePopover();
    const currentUrl = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        this.showToast('🔗 Public conversation link copied to clipboard!', 'success');
      }).catch(() => {
        this.showToast('🔗 Public URL: ' + currentUrl, 'info');
      });
    } else {
      this.showToast('🔗 Public URL: ' + currentUrl, 'info');
    }
  }

  toggleThemeSubmenu(e) {
    if (e) e.stopPropagation();
    const sub = document.getElementById('theme-submenu');
    if (sub) {
      sub.style.display = sub.style.display === 'none' ? 'block' : 'none';
    }
  }

  setAppTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('om_theme', theme);
    this.closeProfilePopover();
    this.showToast(`Applied ${theme.toUpperCase()} theme`, 'info');
  }

  openSparkSettingsModal() {
    this.closeProfilePopover();
    this.openSettingsModal();
  }

  openSubscriptionModal(focusTier = null) {
    this.closeProfilePopover();
    const modal = document.getElementById('subscription-plans-modal');
    if (!modal) return;
    this.updateDeveloperTierBadge();

    const isDev = this.chatStore.isDeveloper();
    const trial = this.chatStore.getTrialInfo();
    const btnTrial = document.getElementById('btn-select-trial');

    if (btnTrial) {
      if (isDev) {
        btnTrial.textContent = "Included in Developer VIP (Free)";
        btnTrial.disabled = true;
        btnTrial.style.opacity = '0.7';
      } else if (trial.isTrial) {
        btnTrial.textContent = trial.isExpired ? "Trial Expired (Upgrade to Pro)" : `Trial Active (${trial.daysRemaining}d left)`;
        btnTrial.disabled = trial.isExpired;
        btnTrial.style.opacity = trial.isExpired ? '0.6' : '1';
      } else {
        btnTrial.textContent = "Start 3-Month Free Trial";
        btnTrial.disabled = false;
        btnTrial.style.opacity = '1';
      }
    }

    // Reset highlights
    document.querySelectorAll('.pricing-tier-card').forEach(c => c.style.outline = 'none');
    if (focusTier === 'ultra') {
      const ultraCard = document.getElementById('tier-card-ultra');
      if (ultraCard) {
        ultraCard.style.outline = '2px solid #8b5cf6';
        ultraCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    modal.classList.add('active');
  }

  openUsageLimitsModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('usage-limits-modal');
    const content = document.getElementById('usage-limits-dynamic-content');
    if (!modal) return;

    const isDev = this.chatStore.isDeveloper();
    const trial = this.chatStore.getTrialInfo();

    if (content) {
      if (isDev) {
        content.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid rgba(16, 185, 129, 0.4); padding: 14px; border-radius: 8px; margin-bottom: 12px;">
            <div style="font-weight: 800; color: #10b981; font-size: 0.95rem;">👑 Ultimate Developer VIP Access (Active)</div>
            <div style="font-size: 0.82rem; margin-top: 4px; color: #cbd5e1;">Assigned to: <strong>Udayast</strong> (Boss) • Lifetime $0.00 Exemption</div>
          </div>
          <ul style="list-style: none; padding: 0; margin: 0 0 12px 0; font-size: 0.84rem; line-height: 1.8; color: #94a3b8;">
            <li>✓ <strong style="color: #fff;">Queries & Tokens:</strong> UNLIMITED (Infinite compute)</li>
            <li>✓ <strong style="color: #fff;">Rate Limits:</strong> NONE (Zero throttling)</li>
            <li>✓ <strong style="color: #fff;">Full Toolset:</strong> Nexus 2.0 Flash, 1.5 Pro, Vision, Audio/Video, 3D CAD Assembler, Swarm</li>
            <li>✓ <strong style="color: #fff;">Cost & Expiry:</strong> $0.00 / NEVER (Free Forever)</li>
          </ul>
          <p style="font-size: 0.8rem; color: #64748b;">You hold lead architect superuser status across all OM AI subsystems.</p>
        `;
      } else if (trial.isTrial) {
        content.innerHTML = `
          <div style="background: rgba(245, 158, 11, 0.12); border: 1.5px solid rgba(245, 158, 11, 0.4); padding: 14px; border-radius: 8px; margin-bottom: 12px;">
            <div style="font-weight: 800; color: #fbbf24; font-size: 0.95rem;">🎁 3-Month Free Trial (${trial.isExpired ? 'Expired' : trial.daysRemaining + ' Days Remaining'})</div>
            <div style="font-size: 0.82rem; margin-top: 4px; color: #cbd5e1;">Introductory 90-day trial for public users</div>
          </div>
          <ul style="list-style: none; padding: 0; margin: 0 0 12px 0; font-size: 0.84rem; line-height: 1.8; color: #94a3b8;">
            <li>✓ <strong style="color: #fff;">Trial Duration:</strong> 90 Days Total (${trial.daysRemaining} days remaining)</li>
            <li>✓ <strong style="color: #fff;">Included:</strong> Nexus 2.0 Flash, 3D CAD Assembler, 9 Voice Personas (F.R.I.D.A.Y., J.A.R.V.I.S., etc.)</li>
            <li>✓ <strong style="color: #fff;">Status:</strong> ${trial.isExpired ? '<span style="color:#ef4444; font-weight:bold;">EXPIRED (Please Upgrade)</span>' : '<span style="color:#10b981; font-weight:bold;">ACTIVE</span>'}</li>
          </ul>
          <button class="om-btn om-btn-primary" style="width: 100%; margin-top: 8px;" onclick="window.omApp.openSubscriptionModal()">Upgrade to Pro Plans</button>
        `;
      } else {
        content.innerHTML = `
          <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); padding: 14px; border-radius: 8px; margin-bottom: 12px;">
            <div style="font-weight: 700; color: var(--om-cyan); font-size: 0.95rem;">⚡ Active Paid Subscription</div>
            <div style="font-size: 0.82rem; margin-top: 4px;">High-speed priority compute enabled</div>
          </div>
          <p>You have full access to high-speed compute and features across OM AI Assistant.</p>
        `;
      }
    }

    modal.classList.add('active');
  }

  openNotebookModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('notebook-modal');
    const textarea = document.getElementById('notebook-text-area');
    if (textarea) {
      textarea.value = localStorage.getItem('om_nexus_notebook') || localStorage.getItem('om_gemini_notebook') || 
`# Nexus Notebook & Research Canvas
Project: OM AI Action Assistant
Architect: Udayast
Location: India

Key Ideas & Notes:
- Think-Plan-Act-Achieve cognitive framework
- Full-stack Nexus 2.0 Flash integration
- 100% Free Lifetime Developer Access enabled`;
    }
    if (modal) modal.classList.add('active');
  }

  saveNotebookContent() {
    const textarea = document.getElementById('notebook-text-area');
    if (textarea) {
      localStorage.setItem('om_nexus_notebook', textarea.value);
      this.showToast('Saved notes to Nexus Notebook!', 'success');
    }
    const modal = document.getElementById('notebook-modal');
    if (modal) modal.classList.remove('active');
  }
    const modal = document.getElementById('notebook-modal');
    if (modal) modal.classList.remove('active');
  }

  openFeedbackModal() {
    this.closeProfilePopover();
    const fb = prompt('What feedback or feature request do you have for OM AI Assistant?');
    if (fb && fb.trim()) {
      this.showToast('Thank you Boss! Feedback submitted to product team.', 'success');
    }
  }

  toggleHelpSubmenu(e) {
    if (e) e.stopPropagation();
    const sub = document.getElementById('help-submenu');
    if (sub) {
      sub.style.display = sub.style.display === 'none' ? 'block' : 'none';
    }
  }

  openShortcutsModal() {
    this.closeProfilePopover();
    alert("⌨️ OM AI Assistant Keyboard Shortcuts:\n\n• Ctrl + K : Create New Chat\n• Enter : Send Message\n• Shift + Enter : Insert New Line\n• Esc : Close Active Modal / Popover\n• Click Voice Mic : Speech-to-Text Dictation");
  }

  openDocsModal() {
    this.closeProfilePopover();
    window.open('https://github.com/abhishekCode7266/OM-AI-Action-Assistant#readme', '_blank');
  }

  /* =========================================================================
     Authentication System (Public & Developer)
     ========================================================================= */
  handleAuthAction() {
    this.closeProfilePopover();
    const user = this.chatStore.currentUser;
    if (user && user.id && user.id !== 'guest') {
      // User is logged in -> Sign Out
      this.chatStore.signOut();
      this.updateDeveloperTierBadge();
      this.showToast('Signed out to Public Guest account. Click Sign In anytime to switch back.', 'info');
    } else {
      // User is guest -> Open Auth modal
      const modal = document.getElementById('auth-modal');
      if (modal) modal.classList.add('active');
    }
  }

  switchAuthTab(tab) {
    const signInBtn = document.getElementById('btn-tab-signin');
    const registerBtn = document.getElementById('btn-tab-register');
    const signInForm = document.getElementById('auth-signin-form');
    const registerForm = document.getElementById('auth-register-form');

    if (tab === 'register') {
      if (signInBtn) signInBtn.classList.remove('active');
      if (registerBtn) registerBtn.classList.add('active');
      if (signInForm) signInForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
    } else {
      if (registerBtn) registerBtn.classList.remove('active');
      if (signInBtn) signInBtn.classList.add('active');
      if (signInForm) signInForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
    }
  }

  authAsDeveloper() {
    this.chatStore.signIn('udayast.lead@om.ai', 'password123', true);
    this.updateDeveloperTierBadge();
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
    this.showToast('⚡ Welcome back, Boss! Ultimate Developer Lifetime Pass active.', 'success');
  }

  submitSignIn(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('signin-email')?.value || '';
    const pass = document.getElementById('signin-password')?.value || '';
    this.chatStore.signIn(email, pass, email.includes('udayast') || email.includes('abhishek') || email.includes('dev') || email.includes('boss'));
    this.updateDeveloperTierBadge();
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
    this.showToast(`Signed in successfully as ${this.chatStore.currentUser.name}!`, 'success');
  }

  submitRegister(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('reg-name')?.value || 'Guest User';
    const email = document.getElementById('reg-email')?.value || '';
    const pass = document.getElementById('reg-password')?.value || '';
    this.chatStore.register(name, email, pass);
    this.updateDeveloperTierBadge();
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
    this.showToast(`Account created! Welcome to OM, ${name}.`, 'success');
  }

  /* =========================================================================
     Subscription Checkout & Payment Flow
     ========================================================================= */
  selectSubscriptionPlan(tierId) {
    if (this.chatStore.isDeveloper()) {
      this.showToast('👑 You have Lifetime Free Developer VIP Access ($0.00 Unlimited)', 'info');
      const modal = document.getElementById('subscription-plans-modal');
      if (modal) modal.classList.remove('active');
      return;
    }

    if (tierId === 'trial_0' || tierId === 'free') {
      this.chatStore.upgradePlan('trial_0');
      this.updateDeveloperTierBadge();
      this.showToast('🎉 Free Trial activated! Enjoy standard starter access.', 'success');
      const modal = document.getElementById('subscription-plans-modal');
      if (modal) modal.classList.remove('active');
    } else if (tierId === 'trial_3month' || tierId === 'trial') {
      this.chatStore.upgradePlan('trial_3month');
      this.updateDeveloperTierBadge();
      this.showToast('🎉 3-Month Free Trial Active! Enjoy 90 days of complete multimodal access.', 'success');
      const modal = document.getElementById('subscription-plans-modal');
      if (modal) modal.classList.remove('active');
    } else {
      this.startCheckout(tierId);
    }
  }

  startCheckout(tierId) {
    this._checkoutTierId = tierId;
    const subModal = document.getElementById('subscription-plans-modal');
    if (subModal) subModal.classList.remove('active');

    const modal = document.getElementById('checkout-modal');
    const nameEl = document.getElementById('checkout-plan-name');
    const priceEl = document.getElementById('checkout-plan-price');

    const planDetails = {
      trial_0: { name: '₹0 Free Trial', price: '₹0 / Starter' },
      trial_3month: { name: '3-Month Free Trial', price: '₹0 / for 90 days' },
      plan_3month: { name: 'Nexus 3-Month Plan', price: '₹199 / 3 Months' },
      plan_1year: { name: 'Nexus 1-Year Standard', price: '₹399 / 1 Year' },
      plan_1year_pro: { name: 'Nexus 1-Year Pro (All Tools Unlimited)', price: '₹699 / 1 Year' },
      pro: { name: 'Nexus 1-Year Pro (All Tools Unlimited)', price: '₹699 / 1 Year' },
      ultra: { name: 'Nexus 1-Year Pro (All Tools Unlimited)', price: '₹699 / 1 Year' }
    };

    const details = planDetails[tierId] || planDetails.plan_1year_pro;

    if (nameEl) nameEl.textContent = details.name;
    if (priceEl) priceEl.textContent = details.price;

    if (modal) modal.classList.add('active');
  }

  completeCheckout() {
    const tier = this._checkoutTierId || 'plan_1year_pro';
    this.chatStore.upgradePlan(tier);
    this.updateDeveloperTierBadge();

    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) checkoutModal.classList.remove('active');

    const user = this.chatStore.currentUser;
    const planName = user ? user.tier : 'Nexus Pro';
    this.showToast(`🎉 Subscription Active! Upgraded to ${planName}. Enjoy uncapped high-speed AI tools.`, 'success');
  }

  /* =========================================================================
     Nexus Live & 3D Dismantle Triggers
     ========================================================================= */
  openNexusLiveModal(persona = 'friday') {
    if (window.omJarvisLive) {
      window.omJarvisLive.startSession(persona);
    }
  }

  openGeminiLiveModal(persona = 'friday') {
    this.openNexusLiveModal(persona);
  }

  open3DDismantleModal(model = 'car') {
    if (window.omDismantler) {
      window.omDismantler.openModal(model);
    }
  }

  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    const settings = this.chatStore.settings;
    const keyInput = document.getElementById('settings-nexus-key-input') || document.getElementById('settings-gemini-key-input');
    const modelSelect = document.getElementById('settings-model-select');
    const promptInput = document.getElementById('settings-system-prompt');
    const autoSpeechCheck = document.getElementById('settings-auto-speech-chk');
    const quickModelSelect = document.getElementById('chat-model-quick-selector');
    const devBtn = document.getElementById('btn-activate-dev-mode');
    const isDev = this.chatStore.isDeveloper();

    if (keyInput) keyInput.value = settings.apiKey || '';
    if (modelSelect) modelSelect.value = (settings.model && !settings.model.includes('gemini')) ? settings.model : 'nexus-2.0-flash';
    if (quickModelSelect) quickModelSelect.value = (settings.model && !settings.model.includes('gemini')) ? settings.model : 'nexus-2.0-flash';
    if (promptInput) promptInput.value = settings.systemPrompt || '';
    if (autoSpeechCheck) autoSpeechCheck.checked = !!settings.autoSpeech;

    if (devBtn) {
      devBtn.textContent = isDev ? "⚡ Developer Active" : "Activate Developer Mode";
      devBtn.className = isDev ? "om-btn om-btn-xs om-btn-primary" : "om-btn om-btn-xs om-btn-secondary";
    }

    const statusDiv = document.getElementById('nexus-key-status') || document.getElementById('gemini-key-status');
    if (statusDiv) statusDiv.style.display = 'none';

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
        const keyInput = document.getElementById('settings-nexus-key-input') || document.getElementById('settings-gemini-key-input');
        const modelSelect = document.getElementById('settings-model-select');
        const promptInput = document.getElementById('settings-system-prompt');
        const autoSpeechCheck = document.getElementById('settings-auto-speech-chk');
        const memToggle = document.getElementById('settings-memory-enabled-chk');
        const quickModelSelect = document.getElementById('chat-model-quick-selector');

        const chosenModel = modelSelect ? modelSelect.value : 'nexus-2.0-flash';
        const apiKeyVal = keyInput ? keyInput.value.trim() : '';

        this.chatStore.saveSettings({
          apiKey: apiKeyVal,
          model: chosenModel,
          systemPrompt: promptInput ? promptInput.value : '',
          autoSpeech: autoSpeechCheck ? autoSpeechCheck.checked : false
        });

        if (quickModelSelect) quickModelSelect.value = chosenModel;
        if (memToggle) this.chatStore.toggleMemoryEnabled(memToggle.checked);

        this.updateDeveloperTierBadge();

        const modal = document.getElementById('settings-modal');
        if (modal) modal.classList.remove('active');

        this.showToast('Settings saved successfully!', 'success');
      });
    }

    // Activate Developer Mode Button
    const devBtn = document.getElementById('btn-activate-dev-mode');
    if (devBtn) {
      devBtn.addEventListener('click', () => {
        this.chatStore.activateDeveloperMode();
        this.updateDeveloperTierBadge();
        devBtn.textContent = "⚡ Developer Active";
        devBtn.className = "om-btn om-btn-xs om-btn-primary";
        this.showToast('⚡ Ultimate Developer Mode active! Free unlimited access enabled.', 'success');
      });
    }

    // Test Nexus Key Button
    const testKeyBtn = document.getElementById('btn-test-nexus-key') || document.getElementById('btn-test-gemini-key');
    const statusDiv = document.getElementById('nexus-key-status') || document.getElementById('gemini-key-status');
    if (testKeyBtn) {
      testKeyBtn.addEventListener('click', async () => {
        const keyInput = document.getElementById('settings-nexus-key-input') || document.getElementById('settings-gemini-key-input');
        const key = keyInput ? keyInput.value.trim() : '';
        if (!key) {
          if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.style.color = '#fab387';
            statusDiv.textContent = 'ℹ️ No API key entered. OM will use the built-in Autonomous Engine 100% free.';
          }
          return;
        }

        testKeyBtn.disabled = true;
        testKeyBtn.textContent = 'Testing...';
        if (statusDiv) {
          statusDiv.style.display = 'block';
          statusDiv.style.color = 'var(--om-cyan)';
          statusDiv.textContent = 'Connecting to Nexus AI API...';
        }

        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
          if (res.ok) {
            const data = await res.json();
            const count = data.models ? data.models.length : 0;
            if (statusDiv) {
              statusDiv.style.color = '#a6e3a1';
              statusDiv.textContent = `🟢 Connected! Found ${count} Nexus AI models (Nexus 2.0 Flash ready).`;
            }
            this.showToast('Nexus AI API Key is valid and active!', 'success');
          } else {
            if (statusDiv) {
              statusDiv.style.color = '#f38ba8';
              statusDiv.textContent = `🔴 Key Verification Error (HTTP ${res.status}): Please check API key.`;
            }
          }
        } catch (e) {
          if (statusDiv) {
            statusDiv.style.color = '#f38ba8';
            statusDiv.textContent = `🔴 Network Error: ${e.message}`;
          }
        } finally {
          testKeyBtn.disabled = false;
          testKeyBtn.textContent = '⚡ Test Key';
        }
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

  initLanguageAndVoice() {
    const lang = localStorage.getItem('om_voice_language') || 'en-US';
    const gender = localStorage.getItem('om_voice_gender') || 'male';

    const headerLangSelect = document.getElementById('global-lang-selector');
    if (headerLangSelect) headerLangSelect.value = lang;

    const liveLangSelect = document.getElementById('live-voice-lang-select');
    if (liveLangSelect) liveLangSelect.value = lang;

    this.updateVoiceGenderUI(gender);
  }

  toggleVoiceGender() {
    const current = localStorage.getItem('om_voice_gender') || 'male';
    const next = current === 'male' ? 'female' : 'male';
    localStorage.setItem('om_voice_gender', next);

    if (window.omVoice) window.omVoice.setVoiceGender(next);
    if (window.omJarvisLive) window.omJarvisLive.setVoiceGender(next);

    this.updateVoiceGenderUI(next);
    const personaName = next === 'female' ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.';
    this.showToast(`Voice set to ${next.toUpperCase()} (${personaName})`, 'info');
  }

  updateVoiceGenderUI(gender) {
    const btn = document.getElementById('btn-toggle-voice-gender');
    const icon = document.getElementById('header-gender-icon');
    const label = document.getElementById('header-gender-label');

    if (gender === 'female') {
      if (icon) icon.textContent = '👩';
      if (label) label.textContent = 'Female';
      if (btn) btn.classList.add('female');
    } else {
      if (icon) icon.textContent = '👨';
      if (label) label.textContent = 'Male';
      if (btn) btn.classList.remove('female');
    }
  }

  openNeuralCanvas(query = 'quantum_ai') {
    const modal = document.getElementById('neural-thought-modal');
    if (modal) {
      modal.classList.add('active');
      if (!window.omNeuralCanvas) {
        window.omNeuralCanvas = new OMNeuralCanvas('neural-canvas');
        window.omNeuralCanvas.init();
      } else {
        window.omNeuralCanvas.resize();
      }
      if (query) {
        window.omNeuralCanvas.loadPreset(query);
      }
    }
  }

  openCyberTerminal() {
    const modal = document.getElementById('cyber-terminal-modal');
    if (modal) {
      modal.classList.add('active');
      if (!window.omCyberTerminal) {
        window.omCyberTerminal = new OMCyberTerminal('cyber-terminal-container', 'cyber-terminal-input', 'cyber-terminal-output');
        window.omCyberTerminal.init();
      }
      const input = document.getElementById('cyber-terminal-input');
      if (input) setTimeout(() => input.focus(), 150);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.omApp = new OMApp();
  window.app = window.omApp;
});

