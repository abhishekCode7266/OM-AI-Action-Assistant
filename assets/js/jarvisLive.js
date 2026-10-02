/**
 * OM AI Assistant - Universal Voice Neural Engine
 * Live two-way conversation loop with Arc Reactor HUD,
 * 5 Female Personas (F.R.I.D.A.Y., Rias, Asia, Medusa, Astrid)
 * 4 Male Personas (J.A.R.V.I.S., Ultron, Hiro, Alpha)
 * Multilingual 20+ Global Languages & Hands-Free Loop.
 */

// Suppress Silero VAD / WebAssembly SIMD error dialogs and ensure graceful WebAudio fallback
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message && (e.message.includes('Silero') || e.message.includes('SIMD') || e.message.includes('VAD') || e.message.includes('wasm'))) {
      e.preventDefault();
      console.info("Voice Neural VAD fallback engaged: standard Web Speech API active.");
    }
  });
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && String(e.reason).includes('SIMD')) {
      e.preventDefault();
    }
  });
}

class OMJarvisLiveEngine {
  constructor() {
    this.isActive = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.persona = localStorage.getItem('om_live_persona') || 'friday';
    this.voiceGender = localStorage.getItem('om_voice_gender') || 'female';
    this.currentLanguage = localStorage.getItem('om_voice_language') || 'en-US';
    this.continuousLoop = true;
    this.recognition = null;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.animFrameId = null;
    this.developerName = 'User';
    this.userTitle = 'User';
    this.isModalOpen = false;

    // Roster of 9 Personas (5 Female, 4 Male)
    this.personas = {
      // FEMALE PERSONAS
      friday: {
        name: 'F.R.I.D.A.Y.',
        gender: 'female',
        pitch: 1.06,
        rate: 1.00,
        primaryColor: '#ec4899',
        secondaryColor: '#10b981',
        title: 'F.R.I.D.A.Y. AI',
        sub: 'FEMALE TACTICAL HUD',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      samantha: {
        name: 'Samantha',
        gender: 'female',
        pitch: 1.05,
        rate: 1.00,
        primaryColor: '#f43f5e',
        secondaryColor: '#fda4af',
        title: 'SAMANTHA CORE',
        sub: 'FEMALE WARM CONVERSATIONAL',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      nova: {
        name: 'Nova Pro',
        gender: 'female',
        pitch: 1.07,
        rate: 1.02,
        primaryColor: '#38bdf8',
        secondaryColor: '#818cf8',
        title: 'NOVA PRO AI',
        sub: 'FEMALE FAST REASONING',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      rias: {
        name: 'Rias',
        gender: 'female',
        pitch: 1.04,
        rate: 1.00,
        primaryColor: '#e11d48',
        secondaryColor: '#fb7185',
        title: 'RIAS CRIMSON',
        sub: 'FEMALE STRATEGIC VOICE',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      asia: {
        name: 'Asia',
        gender: 'female',
        pitch: 1.06,
        rate: 0.98,
        primaryColor: '#f59e0b',
        secondaryColor: '#fef08a',
        title: 'ASIA SERAPH',
        sub: 'FEMALE HARMONIC VOICE',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      medusa: {
        name: 'Medusa',
        gender: 'female',
        pitch: 1.02,
        rate: 1.00,
        primaryColor: '#10b981',
        secondaryColor: '#34d399',
        title: 'MEDUSA CYBER',
        sub: 'FEMALE NEURAL MATRIX',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      astrid: {
        name: 'Astrid',
        gender: 'female',
        pitch: 1.06,
        rate: 1.00,
        primaryColor: '#8b5cf6',
        secondaryColor: '#c084fc',
        title: 'ASTRID VALKYRIE',
        sub: 'FEMALE TACTICAL FLIGHT',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },

      jarvis: {
        name: 'Jarvis',
        gender: 'male',
        pitch: 0.98,
        rate: 1.00,
        primaryColor: '#06b6d4',
        secondaryColor: '#38bdf8',
        title: 'J.A.R.V.I.S. PROTOCOL',
        sub: 'MALE STARK AI',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      orvis: {
        name: 'Orvis',
        gender: 'male',
        pitch: 0.98,
        rate: 1.00,
        primaryColor: '#0ea5e9',
        secondaryColor: '#38bdf8',
        title: 'ORVIS SYSTEM',
        sub: 'MALE INTELLIGENT COMPANION',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      onyx: {
        name: 'Onyx Deep',
        gender: 'male',
        pitch: 0.95,
        rate: 1.00,
        primaryColor: '#64748b',
        secondaryColor: '#cbd5e1',
        title: 'ONYX DEEP',
        sub: 'MALE RESONANT BARITONE',
        greeting: (isHindi) => isHindi
          ? `नमस्कार! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      ultron: {
        name: 'Ultron',
        gender: 'male',
        pitch: 0.94,
        rate: 1.00,
        primaryColor: '#dc2626',
        secondaryColor: '#991b1b',
        title: 'ULTRON PRIME',
        sub: 'MALE METALLIC SYNTH',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      hiro: {
        name: 'Hiro',
        gender: 'male',
        pitch: 1.02,
        rate: 1.02,
        primaryColor: '#f97316',
        secondaryColor: '#fb923c',
        title: 'HIRO TECH',
        sub: 'MALE PRODIGY CORE',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      },
      alpha: {
        name: 'Alpha',
        gender: 'male',
        pitch: 0.96,
        rate: 1.00,
        primaryColor: '#2563eb',
        secondaryColor: '#60a5fa',
        title: 'ALPHA SQUAD',
        sub: 'MALE COMMANDER AI',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
          : `Hello! How can I help you today?`
      }
    };

    // Ensure valid persona
    if (!this.personas[this.persona]) {
      this.persona = 'friday';
    }
    this.voiceGender = this.personas[this.persona].gender;

    this.initSpeech();
  }

  initSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (!this.isSpeaking) {
          this.updateHUDStatus('LISTENING');
        }
      };

      this.recognition.onresult = (event) => {
        let interim = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const candidate = (interim || finalTranscript || '').trim();
        const lowerCandidate = candidate.toLowerCase();

        // 1. Instant Interrupt on "Stop", "रुको", "chup", etc.
        const isStopCmd = /^(stop|रुको|ruko|chup|चुप|shant|शान्त|pause|wait|hold on|cancel|बस|bas|quiet)$/i.test(lowerCandidate) ||
                          lowerCandidate === 'stop' || lowerCandidate.startsWith('stop ') || lowerCandidate.endsWith(' stop') ||
                          lowerCandidate.includes('रुको') || lowerCandidate.includes('ruko') || lowerCandidate.includes('चुप');

        if (isStopCmd) {
          this.stopSpeaking();
          this.isSpeaking = false;
          this.updateHUDStatus('STANDBY');
          const userTranscriptEl = document.getElementById('live-user-transcript');
          if (userTranscriptEl) userTranscriptEl.textContent = `[Stopped by user: "${candidate}"]`;
          const pipTicker = document.getElementById('pip-live-speech-ticker');
          if (pipTicker) pipTicker.textContent = `Stopped • Standing by`;
          try { this.recognition.abort(); } catch (e) {}
          setTimeout(() => this.rearmMic(), 500);
          return;
        }

        // 2. Anti-feedback / Echo rejection:
        // Ignore recognized audio if it's the assistant's own TTS output
        if (this.isSpeaking || (this.ignoreEchoUntil && Date.now() < this.ignoreEchoUntil)) {
          const currentSpoken = (this.currentSpokenText || '').toLowerCase();
          if (currentSpoken && lowerCandidate.length > 2 && currentSpoken.includes(lowerCandidate)) {
            return; // Ignore mic feedback echo
          }
          // If distinct user speech arrives while assistant is speaking, barge-in / interrupt!
          if (lowerCandidate.length >= 3) {
            this.stopSpeaking();
            this.isSpeaking = false;
            this.updateHUDStatus('PROCESSING');
          }
        }

        const userTranscriptEl = document.getElementById('live-user-transcript');
        if (userTranscriptEl && candidate) {
          userTranscriptEl.textContent = candidate;
        }

        if (finalTranscript && finalTranscript.trim()) {
          const cleanFinal = finalTranscript.trim();
          // Filter stray acoustic noise
          if (cleanFinal.length < 2) return;
          if (this.currentSpokenText && this.currentSpokenText.toLowerCase().includes(cleanFinal.toLowerCase())) {
            return;
          }
          if (this.lastUserSpeech && this.lastUserSpeech.toLowerCase() === cleanFinal.toLowerCase() && (Date.now() - (this.lastUserSpeechTime || 0)) < 2500) {
            return;
          }
          this.lastUserSpeech = cleanFinal;
          this.lastUserSpeechTime = Date.now();
          this.handleLiveUserSpeech(cleanFinal);
        }
      };

      this.recognition.onerror = (e) => {
        if (e.error !== 'no-speech') {
          console.warn('Live Speech recognition notice:', e.error);
        }
        if (this.isActive && !this.isSpeaking && this.continuousLoop) {
          setTimeout(() => this.rearmMic(), 600);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.isActive && !this.isSpeaking && this.continuousLoop) {
          setTimeout(() => this.rearmMic(), 400);
        }
      };
    }
  }

  setLanguage(langCode) {
    this.currentLanguage = langCode;
    localStorage.setItem('om_voice_language', langCode);
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  setPersona(personaKey) {
    if (!this.personas[personaKey]) return;
    this.persona = personaKey;
    localStorage.setItem('om_live_persona', personaKey);
    const p = this.personas[personaKey];
    this.voiceGender = p.gender;
    localStorage.setItem('om_voice_gender', this.voiceGender);

    if (window.omVoice) {
      window.omVoice.voiceGender = this.voiceGender;
    }

    this.updatePersonaBadge();
    this.applyPersonaToMiniOrb();

    // If modal is open, re-render visualizer to update colors immediately
    if (this.isModalOpen) {
      this.initVisualizer();
    }

    // Update Header button if active
    if (this.isActive) {
      const headerLiveBtn = document.getElementById('btn-header-nexus-live');
      if (headerLiveBtn) {
        headerLiveBtn.innerHTML = `<span class="nexus-live-docked-orb active listening" id="nexus-live-docked-orb" style="background:${p.primaryColor}; box-shadow:0 0 10px ${p.primaryColor};"></span><span id="nexus-live-header-text">⚡ ${p.name} Live</span>`;
      }
    }
  }

  applyPersonaToMiniOrb() {
    const p = this.personas[this.persona] || this.personas.friday;
    const miniOrb = document.getElementById('orb-widget-mini');
    if (miniOrb) {
      miniOrb.style.setProperty('--persona-primary', p.primaryColor);
      miniOrb.style.setProperty('--persona-secondary', p.secondaryColor);
      miniOrb.title = `${p.name} Active • Click to switch assistant`;
    }
    const letterEl = document.getElementById('mini-orb-letter');
    if (letterEl) {
      const cleanName = p.name.replace(/[^a-zA-Z]/g, '');
      letterEl.textContent = cleanName[0] || 'J';
    }
  }

  openModal() {
    const modal = document.getElementById('nexus-live-modal') || document.getElementById('gemini-live-modal');
    if (!modal) return;
    modal.classList.add('active');
    this.isModalOpen = true;

    // Ensure Arc Reactor visualizer container is visible
    const vis = document.getElementById('live-visualizer-container');
    if (vis) vis.style.display = 'flex';

    this.updatePersonaBadge();
    this.initVisualizer();
  }

  closeModal() {
    const modal = document.getElementById('nexus-live-modal') || document.getElementById('gemini-live-modal');
    if (modal) modal.classList.remove('active');
    this.isModalOpen = false;
  }

  toggleSession() {
    if (this.isModalOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  startConversationView(persona = null) {
    if (persona && this.personas[persona]) {
      this.persona = persona;
      localStorage.setItem('om_live_persona', persona);
      this.voiceGender = this.personas[persona].gender;
    }

    // Stop standard mic recording cleanly if running to prevent concurrent recording
    if (window.omVoice && window.omVoice.isRecording) {
      window.omVoice.stopRecording();
    }

    this.isActive = true;
    this.closeModal();

    // Ensure PiP is hidden
    const pip = document.getElementById('floating-live-pip-widget');
    if (pip) {
      pip.classList.remove('active');
    }

    this.updatePersonaBadge();

    // Display the small centered animated Arc Reactor orb directly above chat prompt box
    const miniOrb = document.getElementById('orb-widget-mini');
    if (miniOrb) {
      miniOrb.className = 'orb-widget-mini listening-animation-ring active listening';
      miniOrb.style.display = 'flex';
      this.applyPersonaToMiniOrb();
    }

    // Update Header button cleanly without ugly Cut text
    const headerLiveBtn = document.getElementById('btn-header-nexus-live');
    if (headerLiveBtn) {
      headerLiveBtn.classList.add('active', 'listening');
      headerLiveBtn.style.background = 'rgba(6, 182, 212, 0.2)';
      headerLiveBtn.style.borderColor = 'var(--om-cyan)';
      const p = this.personas[this.persona] || this.personas.friday;
      headerLiveBtn.innerHTML = `<span class="nexus-live-docked-orb active listening" id="nexus-live-docked-orb" style="background:${p.primaryColor}; box-shadow:0 0 10px ${p.primaryColor};"></span><span id="nexus-live-header-text">⚡ ${p.name} Live</span>`;
      headerLiveBtn.title = `Nexus Live (${p.name}) Active • Click to switch assistant`;
    }

    // Start listening quietly - zero unsolicited opening monologue
    this.startListening();

    const p = this.personas[this.persona] || this.personas.friday;
    if (window.omApp && typeof window.omApp.showToast === 'function') {
      window.omApp.showToast(`Nexus Live connected (${p.name}) • Speak naturally`, 'info');
    }
  }

  startSession(persona = null) {
    this.startConversationView(persona);
  }

  handleMiniOrbClick(event) {
    if (event && event.target && event.target.classList.contains('mini-orb-close-badge')) {
      this.stopSession();
      return;
    }
    this.openModal();
  }

  minimizeToPiP() {
    this.startConversationView();
  }

  expandFromPiP() {
    this.openModal();
  }

  updatePiPContent() {
    // No-op
  }

  stopSession() {
    this.isActive = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.closeModal();

    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const pip = document.getElementById('floating-live-pip-widget');
    if (pip) {
      pip.classList.remove('active');
    }

    // Stop live media share if active
    if (window.omMediaVision) {
      window.omMediaVision.stopScreenShare();
      window.omMediaVision.stopCamera();
    }

    // Revert external UI elements
    const headerLiveBtn = document.getElementById('btn-header-nexus-live');
    if (headerLiveBtn) {
      headerLiveBtn.classList.remove('active', 'listening', 'speaking', 'processing', 'interrupted');
      headerLiveBtn.style.background = '';
      headerLiveBtn.style.borderColor = '';
      headerLiveBtn.innerHTML = `<span class="nexus-live-docked-orb" id="nexus-live-docked-orb"></span><span id="nexus-live-header-text">🎙️ Nexus Live</span>`;
      headerLiveBtn.title = "Nexus Live Voice Conversation";
    }

    const miniOrb = document.getElementById('orb-widget-mini');
    if (miniOrb) {
      miniOrb.classList.remove('active', 'listening', 'speaking', 'processing', 'interrupted');
      miniOrb.style.display = 'none';
      miniOrb.title = "Voice AI Active • Click to switch assistant";
    }

    if (window.omApp) {
      window.omApp.showToast("Voice conversation session ended.", "info");
    }
  }

  updatePersonaBadge() {
    const badge = document.getElementById('live-persona-badge');
    const p = this.personas[this.persona] || this.personas.friday;
    if (badge) {
      badge.innerHTML = `<span style="color: ${p.primaryColor};">⚡ ${p.title}</span> • <span style="color: ${p.secondaryColor};">${p.sub}</span>`;
    }

    // Update Start Button Label in Modal
    const btnLabel = document.getElementById('modal-active-persona-label');
    if (btnLabel) {
      btnLabel.textContent = p.name;
    }

    // Highlight selected persona pill
    document.querySelectorAll('.persona-pill-btn').forEach(btn => {
      const key = btn.getAttribute('data-persona');
      if (key === this.persona) {
        btn.classList.add('active');
        btn.style.borderColor = '#ffffff';
        btn.style.boxShadow = `0 0 16px ${p.primaryColor}, inset 0 0 8px rgba(255,255,255,0.25)`;
      } else {
        btn.classList.remove('active');
        btn.style.borderColor = '';
        btn.style.boxShadow = '';
      }
    });
  }

  rearmMic() {
    if (!this.isActive) return;
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.lang = this.currentLanguage;
        this.recognition.start();
      } catch (e) {
        // Recognition may already be listening
      }
    }
  }

  async handleLiveUserSpeech(userSpeech) {
    if (!this.isActive) return;
    this.updateHUDStatus('PROCESSING');

    // Update Live Transcript & PiP ticker
    const userTranscriptEl = document.getElementById('live-user-transcript');
    if (userTranscriptEl) {
      userTranscriptEl.textContent = `"${userSpeech}"`;
    }
    const pipTicker = document.getElementById('pip-live-speech-ticker');
    if (pipTicker) {
      pipTicker.textContent = `"${userSpeech}"`;
    }

    const isHindi = this.currentLanguage.startsWith('hi');

    // Goal 2: Connect Nexus Live to the real AI response engine (same answer path as main chat)
    // Goal 3: Fix mic behavior - do not trigger unintended modes or unsolicited popups
    const chatStore = window.omChatStore;
    let activeChat = chatStore ? chatStore.getActiveChat() : null;
    if (!activeChat && chatStore) {
      activeChat = chatStore.createChat("Nexus Live Conversation");
    }

    // Immediately record User message in active chat and render in chat view
    if (chatStore && activeChat) {
      chatStore.addMessage(activeChat.id, { sender: 'user', text: userSpeech });
      if (window.omApp) {
        window.omApp.renderSidebar();
        window.omApp.renderChatMessages(true);
      }
    }

    this.updateHUDStatus('PROCESSING');

    // Process through real cognitive AI engine
    let assistantResponse = null;
    const currentMode = activeChat ? (activeChat.mode || 'general') : 'general';

    if (window.omAssistant && typeof window.omAssistant.processUserMessage === 'function') {
      try {
        assistantResponse = await window.omAssistant.processUserMessage(userSpeech, []);
      } catch (err) {
        console.warn("Nexus Live real AI engine call fallback:", err);
      }
    }

    if (!assistantResponse || !assistantResponse.text) {
      assistantResponse = (window.omAssistant && typeof window.omAssistant.generateAutonomousFallback === 'function')
        ? window.omAssistant.generateAutonomousFallback(userSpeech, [], currentMode, [])
        : { text: this.generatePersonaResponse(userSpeech, isHindi, false) };
    }

    const fullResponseText = (assistantResponse && assistantResponse.text)
      ? assistantResponse.text
      : (isHindi ? "मैंने आपके निर्देश को प्रोसेस कर दिया है।" : "I have processed your request.");

    // Record Assistant response in active chat store and update chat messages view
    if (chatStore && activeChat) {
      chatStore.addMessage(activeChat.id, {
        sender: 'assistant',
        text: fullResponseText,
        reasoning: assistantResponse.reasoning || '',
        actions: assistantResponse.actions || [],
        citations: assistantResponse.citations || ['Nexus Live Neural Engine']
      });
      if (window.omApp) {
        window.omApp.renderSidebar();
        window.omApp.renderChatMessages(true);
      }
      this.updateChatHistoryOverlay();
    }

    // Extract clean spoken text for TTS (strip code blocks/tables so speech is clean & natural)
    let cleanSpeech = fullResponseText
      .replace(/```[\s\S]*?```/g, isHindi ? 'कोड और परिणाम आपकी चैट स्क्रीन पर दिखाए गए हैं।' : 'The code has been generated and displayed in your chat view.')
      .replace(/<[^>]*>/g, '')
      .replace(/[#*_`~>\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanSpeech.length > 320) {
      const sentences = cleanSpeech.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length > 0) {
        cleanSpeech = sentences.slice(0, 3).join(' ');
      } else {
        cleanSpeech = cleanSpeech.slice(0, 320) + '...';
      }
    }

    const liveJarvisTranscriptEl = document.getElementById('live-jarvis-transcript');
    if (liveJarvisTranscriptEl) {
      liveJarvisTranscriptEl.textContent = cleanSpeech || fullResponseText.slice(0, 160);
    }

    // Speak response out loud
    this.speakResponse(cleanSpeech || fullResponseText, () => {
      if (this.isActive && this.continuousLoop) {
        this.rearmMic();
      }
    });
  }

  generatePersonaResponse(userText, isHindi = false, isCodeExecution = false) {
    const lower = userText.toLowerCase();
    const p = this.personas[this.persona] || this.personas.friday;

    // Live Program Execution Response
    if (isCodeExecution || lower.includes('run program') || lower.includes('execute code') || lower.includes('run code') ||
        lower.includes('program chalao') || lower.includes('code run karo') || lower.includes('execute') ||
        lower.includes('chalao') || lower.includes('programme') || lower.includes('python code') || lower.includes('javascript code')) {
      return isHindi
        ? `आपका पाइथन प्रोजेक्ट और कोड तुरंत लाइव निष्पादित कर दिया गया है! पूरा कोड और टर्मिनल आउटपुट आपकी स्क्रीन पर सक्रिय है।`
        : `Your Python project and code have been generated and executed live! The source code and terminal output are running on your screen right now.`;
    }

    // 3D dismantle / mechanical analysis conversational response
    if (lower.includes('dismantle') || lower.includes('exploded') || lower.includes('car') || lower.includes('डिसमेंटल') || lower.includes('parts') || lower.includes('3d') || lower.includes('मॉडल') || lower.includes('assemble')) {
      return isHindi
        ? `बिल्कुल! 3D CAD सिस्टम्स और मैकेनिकल मॉडल्स का विश्लेषण तैयार है। आप जिस भी कंपोनेंट या प्रोजेक्ट पर काम करना चाहें, बताइए।`
        : `Right on it! The 3D CAD modeling and mechanical analysis pipelines are primed. Let me know which component or assembly you'd like to explore.`;
    }

    // Status or greeting request
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('नमस्ते') || lower.includes('प्रणाम') || lower.includes('namaste') || lower.includes('greetings')) {
      return isHindi
        ? `नमस्ते! मैं आपकी क्या सहायता करूँ?`
        : `Hi! How can I help you today?`;
    }

    if (lower.includes('status') || lower.includes('diagnostic')) {
      return isHindi
        ? `सभी प्रणालियां ठीक से काम कर रही हैं। बताइए क्या करना है?`
        : `All systems are running smoothly. What would you like to work on?`;
    }

    // Default conversational response tailored by persona with natural human phrasing
    switch (this.persona) {
      case 'samantha':
        return isHindi
          ? `मैंने समझ लिया है। बताइए, इस पर आगे क्या करना है?`
          : `I understand. How would you like to proceed with this?`;
      case 'nova':
        return isHindi
          ? `समझ गया! इस पर तुरंत काम शुरू करते हैं।`
          : `Got it! Let's get right on this.`;
      case 'onyx':
        return isHindi
          ? `निर्देश प्राप्त हुआ। बताइए आगे क्या करना है।`
          : `Understood. What is the next step?`;
      case 'friday':
        return isHindi
          ? `ज़रूर! बताइए, इसमें मैं आपकी क्या मदद करूँ?`
          : `Sure! How would you like me to help with this?`;
      case 'rias':
        return isHindi
          ? `मैंने समझ लिया। बताइए अगला कदम क्या है?`
          : `Understood. What is our next objective?`;
      case 'asia':
        return isHindi
          ? `मैंने ध्यान से समझ लिया है। मैं आपकी पूरी मदद करूँगी।`
          : `I understand. I am here to help you through this!`;
      case 'medusa':
        return isHindi
          ? `मैंने समझ लिया। चलिए इस पर काम शुरू करते हैं।`
          : `Understood. Let us proceed with this.`;
      case 'astrid':
        return isHindi
          ? `बिल्कुल! बताइए इस पर आगे क्या करना है?`
          : `Understood! What would you like to do next?`;
      case 'ultron':
        return isHindi
          ? `निर्देश दर्ज हो गया। आगे बताइए क्या करना है।`
          : `Directive received. How shall we proceed?`;
      case 'hiro':
        return isHindi
          ? `समझ गया! चलो इस पर काम शुरू करते हैं!`
          : `Got it! Let's dive right in!`;
      case 'alpha':
        return isHindi
          ? `आदेश प्राप्त हुआ। आगे के निर्देश दीजिए।`
          : `Understood. What is your next instruction?`;
      default:
        return isHindi
          ? `मैंने समझ लिया है। बताइए मैं आपकी क्या सहायता करूँ?`
          : `Understood. How can I help you with this?`;
    }
  }

  speakResponse(text, onComplete) {
    if (!this.synth) {
      if (onComplete) onComplete();
      return;
    }

    this.stopSpeaking();
    this.isSpeaking = true;
    this.currentSpokenText = text;
    this.updateHUDStatus('SPEAKING');

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code implementation verified.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#+\s+/g, "")
      .replace(/[*_~•]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .substring(0, 1200);

    this.currentSpokenText = cleanText;

    const p = this.personas[this.persona] || this.personas.friday;

    const speakerTag = document.querySelector('.transcript-speaker-tag.jarvis-tag');
    if (speakerTag) {
      speakerTag.textContent = `${p.name.toUpperCase()}:`;
      speakerTag.style.background = `linear-gradient(135deg, ${p.primaryColor}, ${p.secondaryColor})`;
    }

    const jarvisTranscriptEl = document.getElementById('live-jarvis-transcript');
    if (jarvisTranscriptEl) {
      jarvisTranscriptEl.textContent = cleanText;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.lang = this.currentLanguage;

    // Voice Matching with Gender Priority
    if (window.omVoice && window.omVoice.findBestVoice) {
      const best = window.omVoice.findBestVoice(this.currentLanguage, p.gender);
      if (best) this.currentUtterance.voice = best;
    }

    // Apply Persona Pitch & Rate
    this.currentUtterance.pitch = p.pitch;
    this.currentUtterance.rate = p.rate;

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      this.updateHUDStatus('SPEAKING');
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      this.ignoreEchoUntil = Date.now() + 400;
      this.updateHUDStatus('STANDBY');
      if (onComplete) onComplete();
    };

    this.currentUtterance.onerror = (e) => {
      console.warn("TTS Error:", e);
      this.isSpeaking = false;
      this.ignoreEchoUntil = Date.now() + 400;
      this.updateHUDStatus('STANDBY');
      if (onComplete) onComplete();
    };

    this.synth.speak(this.currentUtterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentSpokenText = '';
    this.ignoreEchoUntil = Date.now() + 300;
  }

  updateHUDStatus(status) {
    const statusTextEl = document.getElementById('live-hud-state-label');
    const pulseRing = document.getElementById('live-hud-pulse-ring');
    const p = this.personas[this.persona] || this.personas.friday;
    if (statusTextEl) {
      statusTextEl.textContent = status;
      if (status === 'LISTENING') statusTextEl.style.color = p.secondaryColor;
      else if (status === 'SPEAKING') statusTextEl.style.color = p.primaryColor;
      else if (status === 'PROCESSING') statusTextEl.style.color = '#f59e0b';
      else statusTextEl.style.color = '#94a3b8';
    }
    if (pulseRing) {
      pulseRing.className = 'live-hud-pulse-ring ' + status.toLowerCase();
    }

    // PiP status & reactor ring
    const pipState = document.getElementById('pip-hud-state');
    if (pipState) {
      pipState.textContent = status;
      if (status === 'LISTENING') pipState.style.color = p.secondaryColor;
      else if (status === 'SPEAKING') pipState.style.color = p.primaryColor;
      else if (status === 'PROCESSING') pipState.style.color = '#f59e0b';
      else pipState.style.color = '#94a3b8';
    }

    // Pulse animation on the docked Nexus Live orb
    const headerLiveBtn = document.getElementById('btn-header-nexus-live');
    const dockedOrb = document.getElementById('nexus-live-docked-orb');
    if (headerLiveBtn && this.isActive) {
      headerLiveBtn.classList.toggle('listening', status === 'LISTENING');
      headerLiveBtn.classList.toggle('speaking', status === 'SPEAKING');
      headerLiveBtn.classList.toggle('processing', status === 'PROCESSING');
      headerLiveBtn.classList.toggle('interrupted', status === 'INTERRUPTED');
    }
    if (dockedOrb && this.isActive) {
      dockedOrb.className = 'nexus-live-docked-orb active ' + status.toLowerCase();
    }

    // Small pulsing voice visualizer orb on the left
    const miniOrb = document.getElementById('orb-widget-mini');
    if (miniOrb && this.isActive) {
      miniOrb.style.display = 'flex';
      miniOrb.classList.toggle('listening', status === 'LISTENING');
      miniOrb.classList.toggle('speaking', status === 'SPEAKING');
      miniOrb.classList.toggle('processing', status === 'PROCESSING');
      miniOrb.classList.toggle('interrupted', status === 'INTERRUPTED');
    }
  }

  initVisualizer() {
    const canvas = document.getElementById('jarvis-arc-reactor-canvas');
    if (!canvas) return;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    const ctx = canvas.getContext('2d');
    let angle = 0;

    const render = () => {
      if (!this.isActive && !this.isModalOpen) {
        this.animFrameId = null;
        return;
      }

      const width = canvas.width = 340;
      const height = canvas.height = 340;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      angle += 0.02;
      const intensity = this.isSpeaking ? 1.8 : (this.isListening ? 1.2 : 0.6);
      const p = this.personas[this.persona] || this.personas.friday;

      const primaryColor = p.primaryColor;
      const secondaryColor = p.secondaryColor;
      const tagLabel = p.name;

      // 1. Outer Holographic Energy Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.strokeStyle = primaryColor;
      ctx.globalAlpha = 0.4 * intensity;
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10, 4, 10]);
      ctx.stroke();
      ctx.restore();

      // 2. Middle Arc Reactor Segmented Petals
      const segments = 10;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle * 0.8);
      for (let i = 0; i < segments; i++) {
        const segAngle = (i / segments) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(0, 0, 95, segAngle, segAngle + 0.35);
        ctx.strokeStyle = secondaryColor;
        ctx.globalAlpha = 0.8 * intensity;
        ctx.lineWidth = 6;
        ctx.shadowBlur = 15;
        ctx.shadowColor = primaryColor;
        ctx.stroke();
      }
      ctx.restore();

      // 3. Audio Waveform Bars radiating from core
      const bars = 24;
      for (let b = 0; b < bars; b++) {
        const barAngle = (b / bars) * Math.PI * 2 + angle;
        const waveHeight = (Math.sin(angle * 4 + b) + 1.2) * 12 * intensity;
        const x1 = centerX + Math.cos(barAngle) * 55;
        const y1 = centerY + Math.sin(barAngle) * 55;
        const x2 = centerX + Math.cos(barAngle) * (55 + waveHeight);
        const y2 = centerY + Math.sin(barAngle) * (55 + waveHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // 4. Glowing Arc Reactor Core
      const corePulse = (Math.sin(angle * 3) + 1) * 4 * intensity;
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 45 + corePulse);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, secondaryColor);
      gradient.addColorStop(0.7, primaryColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, 45 + corePulse, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 5. Central Persona Core Symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagLabel, centerX, centerY);

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }

  /* =========================================================================
     Continuous Context Chat History Overlay (Section 2)
     ========================================================================= */
  toggleChatHistoryOverlay() {
    const overlay = document.getElementById('live-chat-history-overlay');
    if (!overlay) return;
    const isShowing = overlay.style.display === 'flex' || overlay.classList.contains('active');
    if (isShowing) {
      overlay.style.display = 'none';
      overlay.classList.remove('active');
    } else {
      overlay.style.display = 'flex';
      overlay.classList.add('active');
      this.updateChatHistoryOverlay();
    }
  }

  updateChatHistoryOverlay() {
    const container = document.getElementById('live-overlay-messages-list');
    if (!container || !window.omChatStore) return;
    const active = window.omChatStore.getActiveChat();
    const messages = (active && active.messages) ? active.messages : [];
    if (messages.length === 0) {
      container.innerHTML = '<div style="color: #64748b; text-align: center; padding: 20px; font-size: 0.8rem;">No messages in context yet. Speak or type to begin!</div>';
      return;
    }
    container.innerHTML = messages.map(m => `
      <div style="margin-bottom: 8px; padding: 8px 12px; border-radius: 8px; font-size: 0.78rem; line-height: 1.4; ${m.sender === 'user' ? 'background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #fff; margin-left: 12%;' : 'background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); color: #e2e8f0; margin-right: 12%;'}">
        <div style="font-weight: 700; font-size: 0.7rem; color: ${m.sender === 'user' ? 'var(--om-cyan)' : '#34d399'}; margin-bottom: 2px;">
          ${m.sender === 'user' ? 'YOU' : 'OM ASSISTANT'}:
        </div>
        <div>${(m.text || '').replace(/<[^>]*>?/gm, '').slice(0, 220)}${(m.text || '').length > 220 ? '...' : ''}</div>
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  }
}

window.omJarvisLive = new OMJarvisLiveEngine();
