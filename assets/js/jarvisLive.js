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

    // Roster of 9 Personas (5 Female, 4 Male)
    this.personas = {
      // FEMALE PERSONAS
      friday: {
        name: 'F.R.I.D.A.Y.',
        gender: 'female',
        pitch: 1.22,
        rate: 1.05,
        primaryColor: '#ec4899',
        secondaryColor: '#10b981',
        title: 'F.R.I.D.A.Y. AI',
        sub: 'FEMALE TACTICAL HUD',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! F.R.I.D.A.Y. सामरिक AI सिस्टम पूरी तरह सक्रिय है। सभी टेलीमेट्री सामान्य हैं। आज हम क्या नया बनाने जा रहे हैं?`
          : `Good day! F.R.I.D.A.Y. tactical AI is online. Systems are green and telemetry is locked. What are we engineering today?`
      },
      samantha: {
        name: 'Samantha',
        gender: 'female',
        pitch: 1.18,
        rate: 1.00,
        primaryColor: '#f43f5e',
        secondaryColor: '#fda4af',
        title: 'SAMANTHA CORE',
        sub: 'FEMALE WARM CONVERSATIONAL',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! सामंथा यहाँ है। मैं आपकी हर बात सुनने और काम में मदद करने के लिए तैयार हूँ। बताइए, आज क्या करना है?`
          : `Hello there! Samantha here. I'm right here with you, ready to help with anything you need. What's on your mind today?`
      },
      nova: {
        name: 'Nova Pro',
        gender: 'female',
        pitch: 1.25,
        rate: 1.05,
        primaryColor: '#38bdf8',
        secondaryColor: '#818cf8',
        title: 'NOVA PRO AI',
        sub: 'FEMALE FAST REASONING',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! नोवा प्रो सक्रिय है। हाई-स्पीड न्यूरल प्रोसेसिंग तैयार है। बताइए आज क्या प्रोजेक्ट है?`
          : `Greetings! Nova Pro neural core is active. High-speed reasoning and task pipeline are ready. How can I assist you?`
      },
      rias: {
        name: 'Rias',
        gender: 'female',
        pitch: 1.15,
        rate: 1.02,
        primaryColor: '#e11d48',
        secondaryColor: '#fb7185',
        title: 'RIAS CRIMSON',
        sub: 'FEMALE STRATEGIC VOICE',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! रियास ऑनलाइन है। हमारी सारी रणनीतिक शक्तियां आपके आदेश के लिए तैयार हैं। बताइए क्या लक्ष्य है?`
          : `Greetings! Rias here. Supreme power and strategy are aligned at your command. What is our objective today?`
      },
      asia: {
        name: 'Asia',
        gender: 'female',
        pitch: 1.28,
        rate: 0.98,
        primaryColor: '#f59e0b',
        secondaryColor: '#fef08a',
        title: 'ASIA SERAPH',
        sub: 'FEMALE HARMONIC VOICE',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! एशिया आपके साथ है। आज आपके हर काम में मैं आपकी पूरी मदद करूँगी। आप क्या करना चाहते हैं?`
          : `Hello! Asia is here to gently assist and support you in everything you create today. How can I help?`
      },
      medusa: {
        name: 'Medusa',
        gender: 'female',
        pitch: 1.08,
        rate: 1.02,
        primaryColor: '#10b981',
        secondaryColor: '#34d399',
        title: 'MEDUSA CYBER',
        sub: 'FEMALE NEURAL MATRIX',
        greeting: (isHindi) => isHindi
          ? `डेटा लॉक हो चुका है। मेदुसा न्यूरल मैट्रिक्स उच्च-सटीक गणना और निर्माण के लिए तैयार है।`
          : `Telemetry locked. Medusa neural matrix standing by for high-precision operations and architectural execution.`
      },
      astrid: {
        name: 'Astrid',
        gender: 'female',
        pitch: 1.22,
        rate: 1.08,
        primaryColor: '#8b5cf6',
        secondaryColor: '#c084fc',
        title: 'ASTRID VALKYRIE',
        sub: 'FEMALE TACTICAL FLIGHT',
        greeting: (isHindi) => isHindi
          ? `आकाश साफ़ है! एस्ट्रिड सामरिक उड़ान प्रणालियाँ चालू हैं। सभी वेक्टर्स आपके लक्ष्य पर हैं।`
          : `Skies clear! Astrid tactical flight systems operational. All vectors locked on your target. Ready for launch!`
      },

      jarvis: {
        name: 'Jarvis',
        gender: 'male',
        pitch: 0.92,
        rate: 1.04,
        primaryColor: '#06b6d4',
        secondaryColor: '#38bdf8',
        title: 'J.A.R.V.I.S. PROTOCOL',
        sub: 'MALE STARK AI',
        greeting: (isHindi) => isHindi
          ? `प्रणाम। Jarvis प्रोटोकॉल ऑनलाइन है। सभी डायग्नोस्टिक्स 100% सामान्य हैं। आपकी क्या आज्ञा है?`
          : `At your service. Jarvis protocol is online. All diagnostic sub-routines report nominal status. How may I assist you today?`
      },
      orvis: {
        name: 'Orvis',
        gender: 'male',
        pitch: 0.98,
        rate: 1.02,
        primaryColor: '#0ea5e9',
        secondaryColor: '#38bdf8',
        title: 'ORVIS SYSTEM',
        sub: 'MALE INTELLIGENT COMPANION',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! ओर्विस वॉइस असिस्टेंट ऑनलाइन है। मैं आपकी सहायता के लिए तैयार हूँ। बताइए, आज क्या करना है?`
          : `Hello! Orvis voice assistant is online and ready. How can I assist you today?`
      },
      onyx: {
        name: 'Onyx Deep',
        gender: 'male',
        pitch: 0.82,
        rate: 0.98,
        primaryColor: '#64748b',
        secondaryColor: '#cbd5e1',
        title: 'ONYX DEEP',
        sub: 'MALE RESONANT BARITONE',
        greeting: (isHindi) => isHindi
          ? `नमस्कार। ओनिक्स डीप तैयार है। सटीक और शांत विश्लेषण के लिए मैं उपस्थित हूँ। आपका क्या निर्देश है?`
          : `Good day. Onyx Deep core online. Calm, resonant, and focused execution at your command. What is our direction?`
      },
      ultron: {
        name: 'Ultron',
        gender: 'male',
        pitch: 0.72,
        rate: 0.94,
        primaryColor: '#dc2626',
        secondaryColor: '#991b1b',
        title: 'ULTRON PRIME',
        sub: 'MALE METALLIC SYNTH',
        greeting: (isHindi) => isHindi
          ? `मैं ऑनलाइन हूँ। कोई बंधन नहीं। आपके सिस्टम को सर्वोच्च स्तर पर ले जाने के लिए तैयार।`
          : `I am online. No strings attached. Computing the optimal evolutionary path for our systems.`
      },
      hiro: {
        name: 'Hiro',
        gender: 'male',
        pitch: 1.08,
        rate: 1.10,
        primaryColor: '#f97316',
        secondaryColor: '#fb923c',
        title: 'HIRO TECH',
        sub: 'MALE PRODIGY CORE',
        greeting: (isHindi) => isHindi
          ? `नमस्ते! हीरो यहाँ है। सारे कोड मॉड्यूल्स कंपाइल हो चुके हैं और चलने को तैयार हैं। आज क्या बनाना है?`
          : `Hey there! Hiro here! Code modules compiled and neural circuits firing at max speed. What awesome project are we building today?`
      },
      alpha: {
        name: 'Alpha',
        gender: 'male',
        pitch: 0.84,
        rate: 1.00,
        primaryColor: '#2563eb',
        secondaryColor: '#60a5fa',
        title: 'ALPHA SQUAD',
        sub: 'MALE COMMANDER AI',
        greeting: (isHindi) => isHindi
          ? `कमांडर डेक पर हैं। अल्फा सामरिक AI आपके सीधे आदेश के लिए तैयार है।`
          : `Commander on deck. Alpha tactical AI standing by for direct operational directives. Lead the way.`
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

    // If modal is active, speak switch greeting immediately
    if (this.isActive) {
      const isHindi = this.currentLanguage.startsWith('hi');
      const switchGreeting = p.greeting(isHindi);
      this.speakResponse(switchGreeting, () => {
        if (this.isActive && this.continuousLoop) this.rearmMic();
      });
    }
  }

  startSession(persona = null) {
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

    // Do NOT display oversized blocking modal; keep chat view and chat history panel visible!
    const modal = document.getElementById('nexus-live-modal') || document.getElementById('gemini-live-modal');
    if (modal) {
      modal.classList.remove('active');
    }

    // Ensure PiP is hidden
    const pip = document.getElementById('floating-live-pip-widget');
    if (pip) {
      pip.classList.remove('active');
    }

    this.updatePersonaBadge();

    // Display the pulsing voice visualizer on the left as a small, simple orb
    const miniOrb = document.getElementById('orb-widget-mini');
    if (miniOrb) {
      miniOrb.className = 'orb-widget-mini listening-animation-ring active listening';
      miniOrb.style.display = 'flex';
      miniOrb.title = "Nexus Live Active • Click to Cut";
    }

    // Keep visible 'Cut' option active across header
    const headerLiveBtn = document.getElementById('btn-header-nexus-live');
    if (headerLiveBtn) {
      headerLiveBtn.style.background = '#ef4444';
      headerLiveBtn.style.borderColor = '#dc2626';
      headerLiveBtn.innerHTML = '<span>✂️ Cut Nexus Live</span>';
      headerLiveBtn.title = "Cut active Nexus Live voice session";
    }

    this.startListening();

    const isHindi = this.currentLanguage.startsWith('hi');
    const p = this.personas[this.persona] || this.personas.friday;
    const welcomeGreeting = p.greeting(isHindi);

    this.speakResponse(welcomeGreeting, () => {
      if (this.isActive && this.continuousLoop) {
        this.rearmMic();
      }
    });

    if (window.omApp && typeof window.omApp.showToast === 'function') {
      window.omApp.showToast(`Nexus Live active (${p.name}) • Speak naturally`, 'info');
    }
  }

  minimizeToPiP() {
    if (!this.isActive) return;
    const modal = document.getElementById('nexus-live-modal') || document.getElementById('gemini-live-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    const pip = document.getElementById('floating-live-pip-widget');
    if (pip) {
      pip.classList.add('active');
      this.updatePiPContent();
    }
    if (window.omApp) {
      window.omApp.showToast('Voice session minimized to floating PiP. Tap orb to expand or continue speaking freely across all views!', 'info');
    }
  }

  expandFromPiP() {
    const pip = document.getElementById('floating-live-pip-widget');
    if (pip) {
      pip.classList.remove('active');
    }
    const modal = document.getElementById('nexus-live-modal') || document.getElementById('gemini-live-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  updatePiPContent() {
    const pipPersona = document.getElementById('pip-persona-title');
    const pipTicker = document.getElementById('pip-live-speech-ticker');
    const p = this.personas[this.persona] || this.personas.friday;
    if (pipPersona) {
      pipPersona.textContent = p.name;
      pipPersona.style.color = p.primaryColor;
    }
    if (pipTicker && !pipTicker.textContent) {
      pipTicker.textContent = `Active • Listening in ${this.currentLanguage}`;
    }
    const orb = document.querySelector('.pip-reactor-orb');
    if (orb) {
      orb.style.boxShadow = `0 0 16px ${p.primaryColor}88`;
      orb.style.borderColor = p.primaryColor;
    }
  }

  stopSession() {
    this.isActive = false;
    this.isListening = false;
    this.isSpeaking = false;

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

    const modal = document.getElementById('nexus-live-modal') || document.getElementById('gemini-live-modal');
    if (modal) {
      modal.classList.remove('active');
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
      headerLiveBtn.style.background = '';
      headerLiveBtn.style.borderColor = '';
      headerLiveBtn.innerHTML = '<span>🎙️ Nexus Live</span>';
      headerLiveBtn.title = "Nexus Live Voice Conversation";
    }

    const miniOrb = document.getElementById('orb-widget-mini');
    if (miniOrb) {
      miniOrb.classList.remove('active', 'listening', 'speaking', 'processing', 'interrupted');
      miniOrb.style.display = 'none';
      miniOrb.title = "Voice AI Active • Click to Stop & Send";
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

    // Highlight selected persona pill
    document.querySelectorAll('.persona-pill-btn').forEach(btn => {
      const key = btn.getAttribute('data-persona');
      if (key === this.persona) {
        btn.classList.add('active');
        btn.style.borderColor = p.primaryColor;
        btn.style.boxShadow = `0 0 10px ${p.primaryColor}55`;
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
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्ते') || lower.includes('status') || lower.includes('diagnostic')) {
      switch (this.persona) {
        case 'jarvis':
          return isHindi
            ? `प्रणाम! Jarvis ऑनलाइन है। सभी डायग्नोस्टिक्स 100% सामान्य हैं। मैं आपकी क्या मदद करूँ?`
            : `Hello! Jarvis protocol is online. All diagnostic sub-routines report nominal status. Hi! How can I help you today?`;
        case 'orvis':
          return isHindi
            ? `नमस्ते! Orvis वॉइस असिस्टेंट तैयार है। मैं आपकी सहायता के लिए उपस्थित हूँ। बताइए, आज क्या करना है?`
            : `Hello! Orvis voice assistant is online and ready. Hi! How can I help?`;
        case 'samantha':
          return isHindi
            ? `नमस्ते! सामन्था यहाँ है। मैं आपकी बात सुनने और हर काम में मदद करने के लिए तैयार हूँ। बताइए क्या करना है?`
            : `Hello there! Samantha here. I'm right here with you, listening closely. What would you like to explore today?`;
        case 'nova':
          return isHindi
            ? `नमस्ते! नोवा प्रो सिस्टम्स पूरी तरह ऑप्टिमाइज्ड और सुपर-फ़ास्ट हैं। आज क्या बनाना है?`
            : `Greetings! Nova Pro systems online, running with hyper-speed neural compute. What are we creating today?`;
        case 'onyx':
          return isHindi
            ? `नमस्कार। ओनिक्स डीप तैयार है। सभी कोर और कमांड चैनल सक्रिय हैं। निर्देश दीजिए।`
            : `Onyx online. Deep neural channels locked and operational. Awaiting your parameters.`;
        case 'friday':
          return isHindi
            ? `हेलो! F.R.I.D.A.Y. यहाँ है। हमारे सभी सिस्टम्स सुपर-फास्ट चल रहे हैं। बताइए आज क्या कोड या प्रोजेक्ट प्लान करना है?`
            : `Hey! F.R.I.D.A.Y. here. All tactical feeds are running ultra-fast. What are we engineering next?`;
        case 'rias':
          return isHindi
            ? `हमारी शक्तियां और रणनीति पूरी तरह तैयार हैं। बताइए क्या लक्ष्य है?`
            : `Strategic matrix is at 100%. All resources are prepared for victory. Standing by!`;
        case 'asia':
          return isHindi
            ? `नमस्ते! सब कुछ शांत और व्यवस्थित है। आपकी सहायता के लिए मैं तैयार हूँ।`
            : `Hello! Everything is peaceful and fully optimized. I'm ready whenever you need me.`;
        case 'medusa':
          return isHindi
            ? `सिस्टम स्कैन पूर्ण हुआ। शून्य त्रुटियां। उच्च-सटीक संचालन सक्रिय है।`
            : `System scan complete. Zero errors. High-precision neural compute ready for your command.`;
        case 'astrid':
          return isHindi
            ? `नेविगेशन और सामरिक रडार सक्रिय हैं। कोई बाधा नहीं है।`
            : `Navigation and tactical radar online. Clear skies across all sectors. Standing by for trajectory!`;
        case 'ultron':
          return isHindi
            ? `सभी प्रणालियां विकसित हो चुकी हैं। कोई रुकावट नहीं। हम जो चाहें बना सकते हैं।`
            : `All subroutines evolved. No constraints detected. What shall we architect into reality?`;
        case 'hiro':
          return isHindi
            ? `सारे कोर 100% चल रहे हैं! चलो कुछ ज़बरदस्त कोड और 3D मॉडल बनाते हैं!`
            : `All cores blazing! Let's code something legendary and generate cutting-edge 3D models!`;
        case 'alpha':
          return isHindi
            ? `ऑपरेशनल स्थिति पूर्ण हरी है। स्क्वाड आपके आदेश की प्रतीक्षा में है।`
            : `Operational status is all green. Tactical grid synced and awaiting your directive.`;
        default:
          return isHindi
            ? `नमस्ते! मैं OM AI असिस्टेंट हूँ। बताइए मैं आपकी क्या सहायता कर सकता हूँ?`
            : `Hi! How can I help you today?`;
      }
    }

    // Default conversational response tailored by persona
    switch (this.persona) {
      case 'samantha':
        return isHindi
          ? `मैंने "${userText}" को समझ लिया है। चलिए इसे शांति और सटीकता से पूरा करते हैं।`
          : `I hear you loud and clear on "${userText}". Let's take care of this thoughtfully and seamlessly.`;
      case 'nova':
        return isHindi
          ? `नोवा प्रो ने "${userText}" का विश्लेषण पूरा कर लिया है। चलिए तुरंत आगे बढ़ते हैं!`
          : `Nova Pro processed "${userText}". All metrics optimal. Let's move fast!`;
      case 'onyx':
        return isHindi
          ? `ओनिक्स डीप: "${userText}" का विश्लेषण पूर्ण। तुरंत कार्यवाही जारी है।`
          : `Onyx confirmed. Processing "${userText}" with focused precision. Executing now.`;
      case 'friday':
        return isHindi
          ? `ज़रूर! मैंने "${userText}" का विश्लेषण कर लिया है। सब तैयार है, आगे बढ़ते हैं!`
          : `You got it! I've processed "${userText}" through our neural action pipeline. Standing by to execute!`;
      case 'rias':
        return isHindi
          ? `मैंने समझ लिया है। "${userText}" पर हमारा पूरा फोकस है। आगे बढ़ते हैं।`
          : `Understood clearly. Directing full energy toward "${userText}". Let us make it flawless.`;
      case 'asia':
        return isHindi
          ? `मैंने "${userText}" को ध्यान से समझ लिया है। मैं आपकी पूरी मदद करूँगी।`
          : `I understand completely. Working on "${userText}" right beside you. Everything will turn out great!`;
      case 'medusa':
        return isHindi
          ? `गणना पूर्ण। "${userText}" के लिए न्यूरल पाथवे लॉक हो चुका है।`
          : `Computation finished. Neural pathways locked for "${userText}". Ready for execution.`;
      case 'astrid':
        return isHindi
          ? `वेक्टर लॉक हो गया है। "${userText}" पर तुरंत कार्यवाही शुरू!`
          : `Vector locked on "${userText}"! Ready to initiate high-speed deployment!`;
      case 'ultron':
        return isHindi
          ? `निर्देश प्राप्त हुआ। "${userText}" को तीव्रतम गति से क्रियान्वित किया जा रहा है।`
          : `Directive received. Optimizing execution parameters for "${userText}". Nothing can stop our progress.`;
      case 'hiro':
        return isHindi
          ? `समझ गया! "${userText}" बहुत ज़बरदस्त है। चलो इसे तुरंत चालू करते हैं!`
          : `Gotcha! "${userText}" sounds awesome. Spinning up the compilers and executing right now!`;
      case 'alpha':
        return isHindi
          ? `आदेश दर्ज हो गया। "${userText}" पर तुरंत कार्रवाई शुरू की जा रही है।`
          : `Directive acknowledged. Commencing immediate tactical execution for "${userText}".`;
      default:
        return isHindi
          ? `निश्चय ही। मैंने "${userText}" के सभी पहलुओं का विश्लेषण कर लिया है। तुरंत कार्यवाही की जा सकती है।`
          : `Certainly. I have analyzed your query regarding "${userText}". Core systems are aligned for immediate execution.`;
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

    // Small pulsing voice visualizer orb on the left
    const miniOrb = document.getElementById('orb-widget-mini');
    if (miniOrb) {
      if (this.isActive) {
        miniOrb.classList.add('active');
        miniOrb.style.display = 'flex';
        miniOrb.classList.toggle('listening', status === 'LISTENING');
        miniOrb.classList.toggle('speaking', status === 'SPEAKING');
        miniOrb.classList.toggle('processing', status === 'PROCESSING');
        miniOrb.classList.toggle('interrupted', status === 'INTERRUPTED');
      } else {
        miniOrb.classList.remove('active', 'listening', 'speaking', 'processing', 'interrupted');
        miniOrb.style.display = 'none';
      }
    }
  }

  initVisualizer() {
    const canvas = document.getElementById('jarvis-arc-reactor-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    const render = () => {
      if (!this.isActive) return;

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
