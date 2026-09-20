/**
 * OM – AI Action Assistant
 * Core Application Controller, Routing, Auth & State
 * 
 * Tagline: "Think. Plan. Act. Achieve."
 */

class OMApp {
  constructor() {
    this.currentView = 'overview';
    this.currentUser = {
      name: 'Rajnesh',
      email: 'rajnesh@om.ai',
      isLoggedIn: true,
      role: 'Action Architect'
    };
    this.activityLog = [];
    this.init();
  }

  init() {
    this.loadActivityLog();
    this.setupNavigation();
    this.setupModals();
    this.setupApiKeyHandlers();
    this.setupHeroButtons();
    this.dismissLoadingScreen();
  }

  dismissLoadingScreen() {
    setTimeout(() => {
      const loader = document.getElementById('om-loading-screen');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 600);
      }
    }, 850);
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (view) {
          this.switchView(view);
        }
      });
    });

    const brandBtn = document.getElementById('navbar-brand-btn');
    if (brandBtn) {
      brandBtn.addEventListener('click', () => this.switchView('overview'));
    }

    // API Key trigger
    const apikeyBtn = document.getElementById('nav-apikey-btn');
    if (apikeyBtn) {
      apikeyBtn.addEventListener('click', () => this.openApiKeyModal());
    }

    const authBtn = document.getElementById('nav-auth-btn');
    if (authBtn) {
      authBtn.addEventListener('click', () => this.openAuthModal());
    }
  }

  openApiKeyModal() {
    const modal = document.getElementById('apikey-modal');
    if (!modal) return;

    let savedKey = localStorage.getItem('om_active_api_key');
    if (!savedKey) {
      savedKey = 'om_live_' + Array.from(crypto.getRandomValues(new Uint8Array(12))).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('om_active_api_key', savedKey);
    }

    const keyField = document.getElementById('om-generated-key-field');
    if (keyField) keyField.value = savedKey;

    const customKeyInput = document.getElementById('custom-provider-key-input');
    const savedCustomKey = localStorage.getItem('om_custom_provider_key') || '';
    if (customKeyInput) customKeyInput.value = savedCustomKey;

    modal.classList.add('active');
  }

  setupApiKeyHandlers() {
    const copyBtn = document.getElementById('btn-copy-om-key');
    const genBtn = document.getElementById('btn-generate-om-key');
    const saveBtn = document.getElementById('btn-save-api-settings');

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const keyField = document.getElementById('om-generated-key-field');
        if (keyField) {
          navigator.clipboard.writeText(keyField.value).then(() => {
            this.showToast('OM API Key copied to clipboard!', 'success');
          }).catch(() => {
            keyField.select();
            document.execCommand('copy');
            this.showToast('OM API Key copied!', 'success');
          });
        }
      });
    }

    if (genBtn) {
      genBtn.addEventListener('click', () => {
        const newKey = 'om_live_' + Array.from(crypto.getRandomValues(new Uint8Array(12))).map(b => b.toString(16).padStart(2, '0')).join('');
        const keyField = document.getElementById('om-generated-key-field');
        if (keyField) keyField.value = newKey;
        localStorage.setItem('om_active_api_key', newKey);
        this.showToast('Generated fresh OM Engine Master Key!', 'info');
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const customKey = document.getElementById('custom-provider-key-input')?.value.trim() || '';
        localStorage.setItem('om_custom_provider_key', customKey);

        const statusEl = document.getElementById('apikey-save-status');
        if (statusEl) {
          statusEl.style.display = 'inline';
          setTimeout(() => { statusEl.style.display = 'none'; }, 2500);
        }

        const msg = customKey ? 'External Model Provider Key connected!' : 'OM Neural Native Engine selected (Free & Active)!';
        this.showToast(msg, 'success');
        document.getElementById('apikey-modal')?.classList.remove('active');
      });
    }

    const testBtn = document.getElementById('btn-test-gemini-key');
    if (testBtn) {
      testBtn.addEventListener('click', async () => {
        const input = document.getElementById('custom-provider-key-input');
        const resultEl = document.getElementById('gemini-test-result');
        const key = input ? input.value.trim() : '';

        if (!key) {
          if (resultEl) {
            resultEl.style.display = 'block';
            resultEl.style.color = '#f87171';
            resultEl.textContent = '✕ Please paste a Google Gemini API Key first (starts with AIzaSy...).';
          }
          this.showToast('Please paste a Gemini key to test.', 'error');
          return;
        }

        testBtn.disabled = true;
        const originalText = testBtn.innerHTML;
        testBtn.innerHTML = '⏳ Testing...';

        if (resultEl) {
          resultEl.style.display = 'block';
          resultEl.style.color = '#38bdf8';
          resultEl.textContent = 'Connecting to Google Gemini 1.5 Flash endpoint...';
        }

        try {
          const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`;
          const res = await fetch(testUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: "Respond with the word OK." }]
              }]
            })
          });

          if (res.ok) {
            localStorage.setItem('om_custom_provider_key', key);
            if (resultEl) {
              resultEl.style.color = '#34d399';
              resultEl.innerHTML = '✓ Google Gemini 1.5 Flash Connected &amp; Verified!';
            }
            this.showToast('Google Gemini API Key is valid and active!', 'success');
          } else {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP status ${res.status}`;
            if (resultEl) {
              resultEl.style.color = '#f87171';
              resultEl.innerHTML = `✕ Verification failed: ${errMsg}`;
            }
            this.showToast(`Verification failed: ${errMsg}`, 'error');
          }
        } catch (netErr) {
          if (resultEl) {
            resultEl.style.color = '#f87171';
            resultEl.innerHTML = `✕ Connection error: ${netErr.message}`;
          }
          this.showToast(`Connection error: ${netErr.message}`, 'error');
        } finally {
          testBtn.disabled = false;
          testBtn.innerHTML = originalText;
        }
      });
    }
  }

  switchView(viewName) {
    const sections = document.querySelectorAll('.view-section');
    const navButtons = document.querySelectorAll('.nav-item-btn');

    sections.forEach(sec => {
      sec.classList.remove('active');
    });

    navButtons.forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
      this.currentView = viewName;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Refresh component-specific renders if needed
      if (viewName === 'dashboard' && window.omDashboard) {
        window.omDashboard.updateMetrics();
      } else if (viewName === 'planner' && window.omPlanner) {
        window.omPlanner.render();
      } else if (viewName === 'knowledge' && window.omKnowledge) {
        window.omKnowledge.render();
      }
    }
  }

  setupHeroButtons() {
    const startBtn = document.getElementById('hero-btn-start');
    const goalBtn = document.getElementById('hero-btn-goal');
    const demoBtn = document.getElementById('hero-btn-demo');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.switchView('assistant');
        const input = document.getElementById('chat-user-input');
        if (input) input.focus();
      });
    }

    if (goalBtn) {
      goalBtn.addEventListener('click', () => this.openGoalModal());
    }

    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.switchView('demo'));
    }
  }

  setupModals() {
    // Close modal triggers
    const closeBtns = document.querySelectorAll('.modal-close-trigger');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.om-modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });

    // Goal creation modal submit
    const submitGoalBtn = document.getElementById('modal-submit-goal');
    if (submitGoalBtn) {
      submitGoalBtn.addEventListener('click', () => {
        const input = document.getElementById('modal-goal-input');
        if (!input || !input.value.trim()) return;

        const goalText = input.value.trim();
        input.value = '';
        document.getElementById('goal-modal').classList.remove('active');

        this.switchView('assistant');
        const chatInput = document.getElementById('chat-user-input');
        if (chatInput && window.omAssistant) {
          chatInput.value = `Decompose my goal: ${goalText}`;
          window.omAssistant.handleUserSubmit();
        }
      });
    }

    // Auth modal submit simulation
    const authSubmit = document.getElementById('modal-auth-submit');
    if (authSubmit) {
      authSubmit.addEventListener('click', () => {
        const email = document.getElementById('auth-email-input').value || 'rajnesh@om.ai';
        this.currentUser.email = email;
        this.currentUser.isLoggedIn = true;
        document.getElementById('auth-modal').classList.remove('active');
        this.showToast(`Authenticated into OM as ${email}`, 'success');
      });
    }
  }

  openGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) {
      modal.classList.add('active');
      const input = document.getElementById('modal-goal-input');
      if (input) input.focus();
    }
  }

  openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  recordActivity(actionText) {
    const item = {
      text: actionText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.activityLog.unshift(item);
    if (this.activityLog.length > 25) this.activityLog.pop();
    this.saveActivityLog();
    this.renderActivityStream();
  }

  saveActivityLog() {
    localStorage.setItem('om_activity_stream', JSON.stringify(this.activityLog));
  }

  loadActivityLog() {
    const saved = localStorage.getItem('om_activity_stream');
    if (saved) {
      try {
        this.activityLog = JSON.parse(saved);
      } catch (e) {
        this.activityLog = [];
      }
    }

    if (this.activityLog.length === 0) {
      this.activityLog = [
        { text: 'OM System Engine booted v2.4 (Active)', time: '10:00 AM' },
        { text: 'Knowledge base synchronized with action registry', time: '10:01 AM' },
        { text: 'Ready for objective decomposition: Think ➔ Plan ➔ Act ➔ Achieve', time: '10:02 AM' }
      ];
    }

    this.renderActivityStream();
  }

  renderActivityStream() {
    const container = document.getElementById('dashboard-activity-stream');
    if (!container) return;

    container.innerHTML = '';
    this.activityLog.slice(0, 6).forEach(act => {
      const row = document.createElement('div');
      row.className = 'activity-item';
      row.innerHTML = `
        <div style="color: var(--om-cyan); font-size: 0.9rem;">⚡</div>
        <div style="flex: 1;">
          <div style="color: #fff; font-size: 0.84rem;">${act.text}</div>
          <div class="activity-time">${act.time}</div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('om-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `om-toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

window.omApp = null;
document.addEventListener('DOMContentLoaded', () => {
  window.omApp = new OMApp();
});
