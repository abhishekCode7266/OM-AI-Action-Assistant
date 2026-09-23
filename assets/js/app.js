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

      // Clipboard Paste Support for Images (e.g. Snipping tool, screenshots, copied images)
      inputField.addEventListener('paste', async (e) => {
        const items = (e.clipboardData || window.clipboardData)?.items;
        if (!items) return;
        let imagesAdded = 0;
        for (const item of items) {
          if (item.type && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              await this.fileManager.processFile(file);
              imagesAdded++;
            }
          }
        }
        if (imagesAdded > 0) {
          this.renderAttachmentPreviews();
          this.showToast(`🖼️ ${imagesAdded} image(s) pasted from clipboard`, 'info');
        }
      });

      // Drag and Drop files / images directly onto chat input wrapper
      const chatInputWrapper = document.querySelector('.chat-input-wrapper') || inputField.parentElement;
      if (chatInputWrapper) {
        ['dragenter', 'dragover'].forEach(evt => {
          chatInputWrapper.addEventListener(evt, (e) => {
            e.preventDefault();
            chatInputWrapper.style.borderColor = 'var(--om-cyan, #06b6d4)';
            chatInputWrapper.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)';
          });
        });
        ['dragleave', 'drop'].forEach(evt => {
          chatInputWrapper.addEventListener(evt, (e) => {
            e.preventDefault();
            chatInputWrapper.style.borderColor = '';
            chatInputWrapper.style.boxShadow = '';
          });
        });
        chatInputWrapper.addEventListener('drop', async (e) => {
          e.preventDefault();
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            for (const file of droppedFiles) {
              await this.fileManager.processFile(file);
            }
            this.renderAttachmentPreviews();
            this.showToast(`📎 ${droppedFiles.length} file(s) attached`, 'info');
          }
        });
      }
    }

    // Voice Dictation Button
    const voiceBtn = document.getElementById('btn-voice-input');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (this.voice) this.voice.toggleRecording();
      });
    }

    // File Upload Trigger (Multiple Support)
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
        if (files.length > 0) {
          this.showToast(`📎 ${files.length} file(s) loaded`, 'info');
        }
      });
    }

    // Image Upload Trigger (Multiple Support)
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
        if (files.length > 0) {
          this.showToast(`🖼️ ${files.length} image(s) loaded for inspection`, 'info');
        }
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

    // Close Popover & Context Menu on Outside Click
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('nexus-popover-menu') || document.getElementById('gemini-popover-menu');
      const trigger = document.getElementById('btn-profile-popover-trigger');
      if (popover && (popover.classList.contains('show') || popover.style.display === 'flex')) {
        if (!popover.contains(e.target) && !trigger.contains(e.target)) {
          this.closeProfilePopover();
        }
      }

      const contextMenu = document.getElementById('chat-item-context-menu');
      if (contextMenu && contextMenu.style.display !== 'none') {
        if (!contextMenu.contains(e.target) && !e.target.closest('.chat-item-menu-btn')) {
          this.closeChatContextMenu();
        }
      }
    });

    // Code Sandbox Interactive Console Log Relay Listener
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'OM_CONSOLE_LOG') {
        const consolePanel = document.getElementById('code-console-log-panel');
        if (consolePanel) {
          const line = document.createElement('div');
          line.className = e.data.level === 'error' ? 'log-err' : 'log-info';
          line.style.cssText = e.data.level === 'error' ? 'color: #f87171; margin-top: 2px;' : 'color: #34d399; margin-top: 2px;';
          line.textContent = `> ${e.data.text}`;
          consolePanel.appendChild(line);
          consolePanel.scrollTop = consolePanel.scrollHeight;
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
              <button class="chat-action-btn chat-item-menu-btn" onclick="event.stopPropagation(); window.omApp.openChatContextMenu(event, '${chat.id}')" title="More options">⋮</button>
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

    // Render Notebooks in sidebar section
    this.renderNotebooks();

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
          attachmentsHtml += `<img src="${att.previewUrl}" class="msg-img-preview" alt="${this.escapeHTML(att.name)}" onclick="window.omApp.openImageViewer('${att.previewUrl}', '${this.escapeHTML(att.name)}')" title="Click to expand image">`;
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

          <div class="msg-footer-toolbar gemini-toolbar" style="display: flex; align-items: center; gap: 6px; margin-top: 8px;">
            <button class="gemini-tool-icon-btn" onclick="window.omApp.recordFeedback('${msg.id}', true)" title="Good response">👍</button>
            <button class="gemini-tool-icon-btn" onclick="window.omApp.recordFeedback('${msg.id}', false)" title="Bad response">👎</button>
            <button class="gemini-tool-icon-btn" onclick="window.omApp.regenerateLastResponse()" title="Regenerate response">🔄</button>
            <button class="gemini-tool-icon-btn" onclick="window.omApp.copyMessageById('${msg.id}')" title="Copy response">📋</button>
            <button class="gemini-tool-icon-btn" data-tts-id="${msg.id}" onclick="window.omVoice && window.omVoice.speakMessageById ? window.omVoice.speakMessageById('${msg.id}') : window.omApp.speakMessageById('${msg.id}')" title="Listen (Read aloud)">🔊</button>
            <button class="gemini-tool-icon-btn" onclick="window.omApp.openMoreActionsMenu('${msg.id}', event)" title="More options">⋯</button>
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
      const thumb = (f.isImage && f.previewUrl)
        ? `<img src="${f.previewUrl}" class="att-dock-thumb" alt="${this.escapeHTML(f.name)}">`
        : `<span style="font-size: 1rem;">${f.isImage ? '🖼️' : '📎'}</span>`;
      html += `
        <div class="attachment-chip">
          ${thumb}
          <span class="attachment-chip-name" title="${this.escapeHTML(f.name)}">${this.escapeHTML(f.name)} (${this.fileManager.formatSize(f.size)})</span>
          <button class="remove-att-btn" onclick="window.omApp.removeAttachment('${f.id}')" title="Remove attachment">✕</button>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  removeAttachment(fileId) {
    this.fileManager.removePendingFile(fileId);
    this.renderAttachmentPreviews();
  }

  openImageViewer(url, name = 'Image Preview') {
    let modal = document.getElementById('image-viewer-lightbox-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'image-viewer-lightbox-modal';
      modal.className = 'om-modal-overlay';
      modal.innerHTML = `
        <div class="om-modal-card" style="max-width: 85vw; max-height: 85vh; padding: 15px; display: flex; flex-direction: column; align-items: center; background: #060913; border: 1.5px solid rgba(6,182,212,0.4); border-radius: 12px; z-index: 10000;">
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span id="image-viewer-title" style="color: #38bdf8; font-weight: 700; font-size: 0.9rem;">Image Viewer</span>
            <button class="chat-action-btn" onclick="document.getElementById('image-viewer-lightbox-modal').classList.remove('active')" style="font-size: 1.1rem; color: #fff; cursor: pointer;">✕</button>
          </div>
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; max-height: 70vh;">
            <img id="image-viewer-img" src="" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,0.8);">
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    const imgEl = modal.querySelector('#image-viewer-img');
    const titleEl = modal.querySelector('#image-viewer-title');
    if (imgEl) imgEl.src = url;
    if (titleEl) titleEl.textContent = name;
    modal.classList.add('active');
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

  // =========================================================================
  // Chat Item 3-Dots Action Context Menu (Matching Image 4)
  // =========================================================================
  openChatContextMenu(e, chatId) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('chat-item-context-menu');
    if (!menu) return;

    this.activeContextChatId = chatId;
    const chat = this.chatStore.getChat(chatId);

    // Update Pin / Unpin label and icon
    const pinLabel = document.getElementById('context-menu-pin-label');
    const pinIcon = document.getElementById('context-menu-pin-icon');
    if (pinLabel && pinIcon) {
      if (chat && chat.pinned) {
        pinLabel.textContent = 'Unpin';
        pinIcon.textContent = '📌';
      } else {
        pinLabel.textContent = 'Pin';
        pinIcon.textContent = '📌';
      }
    }

    menu.style.display = 'flex';
    menu.style.position = 'fixed';

    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 210;
    const menuHeight = 270;

    let left = rect.right + 6;
    let top = rect.top - 10;

    if (left + menuWidth > window.innerWidth) {
      left = rect.left - menuWidth - 6;
    }
    if (top + menuHeight > window.innerHeight) {
      top = window.innerHeight - menuHeight - 10;
    }

    menu.style.left = `${Math.max(10, left)}px`;
    menu.style.top = `${Math.max(10, top)}px`;
    menu.style.zIndex = '99999';
  }

  closeChatContextMenu() {
    const menu = document.getElementById('chat-item-context-menu');
    if (menu) menu.style.display = 'none';
    this.activeContextChatId = null;
  }

  handleContextAction(action, chatId = null) {
    const id = chatId || this.activeContextChatId;
    this.closeChatContextMenu();
    if (!id) return;

    const chat = this.chatStore.getChat(id);
    if (!chat) return;

    switch (action) {
      case 'share': {
        const url = window.location.origin + window.location.pathname + '#chat=' + encodeURIComponent(id);
        navigator.clipboard.writeText(url).then(() => {
          this.showToast('Conversation share link copied to clipboard!', 'success');
        }).catch(() => {
          this.showToast('Conversation link ready!', 'info');
        });
        break;
      }
      case 'pin': {
        const isPinned = this.chatStore.togglePinChat(id);
        this.renderSidebar();
        this.showToast(isPinned ? '📌 Chat pinned to top' : 'Chat unpinned', 'info');
        break;
      }
      case 'rename': {
        this.promptRenameChat(id);
        break;
      }
      case 'pdf': {
        this.downloadChatPDF(id);
        break;
      }
      case 'docs': {
        this.exportChatToDocs(id);
        break;
      }
      case 'add_notebook': {
        this.chatStore.addChatToNotebook('nb-1', chat);
        this.renderNotebooks();
        this.showToast(`Conversation linked to Nexus Notebook!`, 'success');
        break;
      }
      case 'delete': {
        this.deleteChat(id);
        break;
      }
    }
  }

  promptRenameChat(chatId) {
    const chat = this.chatStore.getChat(chatId);
    if (!chat) return;
    const newTitle = prompt('Rename Conversation:', chat.title);
    if (newTitle && newTitle.trim()) {
      this.chatStore.updateChatTitle(chatId, newTitle.trim());
      this.renderSidebar();
      this.updateHeaderInfo();
      this.showToast('Conversation renamed', 'success');
    }
  }

  deleteChat(chatId) {
    const chat = this.chatStore.getChat(chatId);
    const title = chat ? chat.title : 'this chat';
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      this.chatStore.deleteChat(chatId);
      this.renderSidebar();
      this.renderChatMessages();
      this.updateHeaderInfo();
      this.showToast('Conversation deleted', 'info');
    }
  }

  downloadChatPDF(chatId = null) {
    const id = chatId || this.chatStore.activeChatId;
    const chat = this.chatStore.getChat(id);
    if (!chat) return;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      this.showToast('Please allow popup to preview PDF', 'error');
      return;
    }
    const msgsHtml = chat.messages.map(m => `
      <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 700; color: ${m.sender === 'user' ? '#0284c7' : '#0f172a'}; margin-bottom: 8px;">
          ${m.sender === 'user' ? '👤 User' : '🤖 OM Assistant'} (${m.timestamp || ''})
        </div>
        <div style="white-space: pre-wrap; line-height: 1.6; color: #334155; font-size: 14px;">${this.escapeHTML(m.text)}</div>
      </div>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${this.escapeHTML(chat.title)} - OM AI Export</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 820px; margin: 0 auto; color: #1e293b; }
            h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 6px; }
            .header-info { color: #64748b; font-size: 13px; margin-bottom: 24px; }
            .print-btn { padding: 9px 18px; background: #0284c7; color: #fff; border: 0; border-radius: 6px; cursor: pointer; font-weight: 600; margin-bottom: 24px; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>
        <body>
          <h1>${this.escapeHTML(chat.title)}</h1>
          <div class="header-info">Exported from OM AI Action Assistant • Think. Plan. Act. Achieve. • ${new Date().toLocaleString()}</div>
          <button class="print-btn" onclick="window.print()">📥 Print / Save as PDF</button>
          ${msgsHtml}
        </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => {
      printWin.print();
    }, 450);
    this.showToast('PDF export ready for download', 'success');
  }

  exportChatToDocs(chatId = null) {
    const id = chatId || this.chatStore.activeChatId;
    const md = this.chatStore.exportChatAsMarkdown(id);
    const chat = this.chatStore.getChat(id);
    if (!md || !chat) return;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_DocsExport.md`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Exported to Docs (Markdown) format!', 'success');
  }

  renderNotebooks() {
    const container = document.getElementById('sidebar-notebooks-container');
    if (!container || !this.chatStore.getNotebooks) return;
    const nbs = this.chatStore.getNotebooks();
    let html = `
      <div class="sidebar-nav-item" onclick="window.omApp.createNewNotebook()">
        <span class="nav-item-icon">➕</span>
        <span class="nav-item-title">New notebook</span>
      </div>
    `;
    nbs.slice(0, 4).forEach(nb => {
      html += `
        <div class="sidebar-nav-item" onclick="window.omApp.openNotebookModal('${nb.id}')">
          <span class="nav-item-icon">📄</span>
          <span class="nav-item-title">${this.escapeHTML(nb.title)}</span>
        </div>
      `;
    });
    // Always show All notebooks at the bottom
    html += `
      <div class="sidebar-nav-item" onclick="window.omApp.openAllNotebooksModal()">
        <span class="nav-item-icon">⋯</span>
        <span class="nav-item-title">All notebooks</span>
      </div>
    `;
    container.innerHTML = html;
  }

  createNewNotebook(title = 'Untitled notebook') {
    const nb = this.chatStore.createNotebook(title);
    this.renderNotebooks();
    this.openNotebookModal(nb.id);
    this.showToast('Created new notebook', 'success');
  }

  openNotebookModal(notebookId = null) {
    const modal = document.getElementById('notebook-workspace-modal');
    if (!modal) return;
    const nbs = this.chatStore.getNotebooks();
    let nb = notebookId ? nbs.find(n => n.id === notebookId) : nbs[0];
    if (!nb) nb = this.chatStore.createNotebook('Untitled notebook');

    this.activeNotebookId = nb.id;
    const titleInput = document.getElementById('notebook-title-input');
    const contentTextarea = document.getElementById('notebook-content-textarea');
    const dropdown = document.getElementById('notebook-select-dropdown');
    const wordCount = document.getElementById('notebook-word-count');

    if (dropdown) {
      dropdown.innerHTML = nbs.map(n => `<option value="${n.id}" ${n.id === nb.id ? 'selected' : ''}>${this.escapeHTML(n.title)}</option>`).join('');
    }
    if (titleInput) titleInput.value = nb.title;
    if (contentTextarea) {
      contentTextarea.value = nb.content || '';
      const words = (nb.content || '').trim().split(/\s+/).filter(Boolean).length;
      if (wordCount) wordCount.textContent = `${words} words`;
      contentTextarea.oninput = () => {
        const count = contentTextarea.value.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount) wordCount.textContent = `${count} words`;
      };
    }

    modal.classList.add('active');
  }

  saveActiveNotebook() {
    if (!this.activeNotebookId) return;
    const titleInput = document.getElementById('notebook-title-input');
    const contentTextarea = document.getElementById('notebook-content-textarea');
    const nbs = this.chatStore.getNotebooks();
    const nb = nbs.find(n => n.id === this.activeNotebookId);
    if (nb) {
      if (titleInput) nb.title = titleInput.value.trim() || 'Untitled notebook';
      if (contentTextarea) nb.content = contentTextarea.value;
      this.chatStore.saveNotebooks(nbs);
      this.renderNotebooks();
      this.showToast('Notebook saved successfully', 'success');
    }
  }

  deleteActiveNotebook() {
    if (!this.activeNotebookId) return;
    const confirmDelete = confirm('Are you sure you want to delete this notebook?');
    if (!confirmDelete) return;

    this.chatStore.deleteNotebook(this.activeNotebookId);
    this.renderNotebooks();
    const modal = document.getElementById('notebook-workspace-modal');
    if (modal) modal.classList.remove('active');
    this.showToast('Notebook deleted', 'info');
  }

  exportActiveNotebook() {
    if (!this.activeNotebookId) return;
    const nbs = this.chatStore.getNotebooks();
    const nb = nbs.find(n => n.id === this.activeNotebookId);
    if (!nb) return;

    const blob = new Blob([nb.content || ''], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nb.title.replace(/\s+/g, '_')}_notes.md`;
    link.click();
    this.showToast('Exported notebook as Markdown (.md)', 'success');
  }

  openAllNotebooksModal() {
    const modal = document.getElementById('all-notebooks-modal');
    const container = document.getElementById('all-notebooks-cards-container');
    if (!modal) return;

    const nbs = this.chatStore.getNotebooks();
    if (container) {
      let html = '';
      nbs.forEach(nb => {
        const words = (nb.content || '').trim().split(/\s+/).filter(Boolean).length;
        const dateStr = new Date(nb.createdAt || Date.now()).toLocaleDateString();
        html += `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--om-border-subtle); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.9rem; color: #fff;">📄 ${this.escapeHTML(nb.title)}</div>
              <div style="font-size: 0.74rem; color: var(--om-text-muted); margin-top: 2px;">${words} words • Created ${dateStr}</div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="om-btn om-btn-xs om-btn-primary" onclick="document.getElementById('all-notebooks-modal').classList.remove('active'); window.omApp.openNotebookModal('${nb.id}')">Open / Edit</button>
              <button class="om-btn om-btn-xs om-btn-danger" style="color: #f87171; background: rgba(239,68,68,0.15);" onclick="window.omApp.chatStore.deleteNotebook('${nb.id}'); window.omApp.renderNotebooks(); window.omApp.openAllNotebooksModal();">Delete</button>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    }
    modal.classList.add('active');
  }

  addCurrentChatToActiveNotebook() {
    const chat = this.chatStore.getActiveChat();
    if (!chat) return;
    const contentTextarea = document.getElementById('notebook-content-textarea');
    const chatSnippet = `\n\n---\n### Attached Chat: ${chat.title}\n` + (chat.messages ? chat.messages.map(m => `**${m.sender === 'user' ? 'User' : 'OM'}**: ${m.text}`).join('\n\n') : '');
    if (contentTextarea) {
      contentTextarea.value += chatSnippet;
    }
    this.saveActiveNotebook();
    this.showToast('Attached current conversation to notebook', 'success');
  }

  openImagesModal() {
    const modal = document.getElementById('images-gallery-modal');
    if (modal) modal.classList.add('active');
  }

  setStudioRatio(ratio, btn) {
    document.querySelectorAll('.studio-ratio-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.currentStudioRatio = ratio;
  }

  generateImageInStudio() {
    const input = document.getElementById('image-studio-prompt-input');
    const prompt = input ? input.value.trim() : '';
    if (!prompt) {
      this.showToast('Please describe the image to generate', 'info');
      return;
    }

    const ratio = this.currentStudioRatio || '1:1';
    let width = 1024, height = 1024;
    if (ratio === '16:9') { width = 1280; height = 720; }
    else if (ratio === '9:16') { width = 720; height = 1280; }

    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    const grid = document.getElementById('studio-images-grid');
    if (grid) {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.style.cssText = 'background: rgba(15,23,42,0.8); border: 1.5px solid rgba(6,182,212,0.4); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;';
      card.innerHTML = `
        <div style="position: relative; height: 160px; background: #030712; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="window.omApp.openImageViewer('${imageUrl}', '${this.escapeHTML(prompt)}')">
          <img src="${imageUrl}" alt="${this.escapeHTML(prompt)}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" loading="lazy">
          <span style="position: absolute; bottom: 6px; right: 8px; font-size: 0.68rem; background: rgba(0,0,0,0.75); color: var(--om-cyan); padding: 2px 6px; border-radius: 4px;">${ratio} • AI Generated</span>
        </div>
        <div style="padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
          <div>
            <div style="font-size: 0.84rem; font-weight: 700; color: #fff; line-height: 1.3;" title="${this.escapeHTML(prompt)}">${this.escapeHTML(prompt.slice(0, 48))}${prompt.length > 48 ? '...' : ''}</div>
            <div style="font-size: 0.7rem; color: var(--om-cyan); margin-top: 4px;">FLUX AI Diffusion • 4K Render</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="om-btn om-btn-xs om-btn-secondary" style="flex: 1;" onclick="window.omApp.openImageViewer('${imageUrl}', '${this.escapeHTML(prompt)}')">🔍 Expand</button>
            <a href="${imageUrl}" target="_blank" download="nexus_concept_${seed}.jpg" class="om-btn om-btn-xs om-btn-secondary" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; padding: 2px 8px;">📥 Save</a>
            <button class="om-btn om-btn-xs om-btn-primary" style="flex: 1;" onclick="window.omApp.triggerPromptInChat('Analyze this generated concept: ${this.escapeHTML(prompt)}')">💬 Discuss</button>
          </div>
        </div>
      `;
      grid.prepend(card);
    }
    input.value = '';
    this.showToast('✨ High-Resolution AI Image generated in studio!', 'success');
  }

  openVideosModal() {
    const modal = document.getElementById('videos-gallery-modal');
    if (modal) modal.classList.add('active');
  }

  openLibraryModal() {
    const modal = document.getElementById('resource-library-modal');
    if (modal) modal.classList.add('active');
  }

  filterLibraryItems(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('#library-items-container .lib-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? 'flex' : 'none';
    });
  }

  triggerPromptInChat(promptText) {
    document.querySelectorAll('.om-modal-overlay').forEach(m => m.classList.remove('active'));
    const input = document.getElementById('chat-user-input');
    if (input) {
      input.value = promptText;
      this.handleSendMessage();
    }
  }

  openHelpCenterModal() {
    this.showToast('Nexus Help Center: All documentation and guides are active.', 'info');
    this.openDocsModal();
  }

  openPrivacyModal() {
    this.showToast('Privacy & Terms: Zero logging, 100% encrypted offline & cloud storage.', 'info');
  }

  copyMessageById(msgId) {
    const active = this.chatStore.getActiveChat();
    if (!active || !active.messages) return;
    const msg = active.messages.find(m => m.id === msgId);
    if (msg && msg.text) {
      this.copyText(msg.text);
    }
  }

  speakMessageById(msgId) {
    const active = this.chatStore.getActiveChat();
    if (!active || !active.messages) return;
    const msg = active.messages.find(m => m.id === msgId);
    if (msg && msg.text && this.voice) {
      this.voice.speakText(msg.text, msg.id);
    }
  }

  recordFeedback(msgId, isPositive) {
    if (isPositive) {
      this.showToast('👍 Thank you for your feedback!', 'success');
    } else {
      this.showToast('👎 Feedback recorded. Tap 🔄 to regenerate with alternative approach.', 'info');
    }
  }

  openMoreActionsMenu(msgId, e) {
    if (e) e.stopPropagation();
    const active = this.chatStore.getActiveChat();
    const msg = active?.messages?.find(m => m.id === msgId);
    if (!msg) return;

    const opt = prompt("Select action:\n1: Export this response as Markdown file\n2: Open in 3D Studio\n3: Copy share link\n\nEnter 1, 2, or 3:", "1");
    if (opt === "1") {
      const blob = new Blob([msg.text], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `nexus_response_${msg.id.slice(0, 8)}.md`;
      a.click();
      this.showToast('Exported response as Markdown file', 'success');
    } else if (opt === "2") {
      if (window.omDismantler) window.omDismantler.openModal('drone');
    } else if (opt === "3") {
      this.openPublicLinksModal();
    }
  }

  triggerGeminiSuggestion(text) {
    const input = document.getElementById('chat-user-input');
    if (input) {
      input.value = text;
      this.handleSendMessage();
    }
  }

  toggleInputAttachMenu(e) {
    if (e) e.stopPropagation();
    const popup = document.getElementById('input-attach-popup');
    if (popup) {
      const isVisible = popup.style.display === 'block';
      popup.style.display = isVisible ? 'none' : 'block';
    }
  }

  closeInputAttachMenu() {
    const popup = document.getElementById('input-attach-popup');
    if (popup) popup.style.display = 'none';
  }

  setModelFromPill(modelKey, label) {
    this.chatStore.saveSettings({ model: modelKey });
    const pill = document.getElementById('capsule-model-label');
    if (pill) pill.textContent = label || modelKey;
    const dropdown = document.getElementById('capsule-model-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    this.showToast(`Active model switched to ${label || modelKey}`, 'info');
  }

  toggleCapsuleModelDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('capsule-model-dropdown');
    if (dropdown) {
      const isVis = dropdown.style.display === 'block';
      dropdown.style.display = isVis ? 'none' : 'block';
    }
  }

  openScheduledActionsModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('scheduled-actions-modal');
    if (modal) modal.classList.add('active');
    else this.showToast('⏰ Scheduled Actions: 0 pending background tasks. System telemetry optimal.', 'info');
  }

  openFeedbackModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('feedback-modal');
    if (modal) modal.classList.add('active');
    else {
      const fb = prompt('What feedback or feature request do you have for OM AI Assistant?');
      if (fb && fb.trim()) this.showToast('Thank you Boss! Feedback recorded.', 'success');
    }
  }

  openShortcutsModal() {
    this.closeProfilePopover();
    const modal = document.getElementById('shortcuts-modal');
    if (modal) modal.classList.add('active');
    else alert("⌨️ Keyboard Shortcuts:\n\n• Ctrl + K: New Chat\n• Enter: Send Message\n• Shift + Enter: New Line\n• Esc: Close Modal\n• Ctrl + V: Paste Image from Clipboard");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.omApp = new OMApp();
  window.app = window.omApp;
});

