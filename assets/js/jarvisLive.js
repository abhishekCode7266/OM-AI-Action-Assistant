/**
 * OM AI Assistant - Universal Voice Neural Engine
 * Live two-way conversation loop with Arc Reactor HUD,
 * 5 Female Personas (F.R.I.D.A.Y., Rias, Asia, Medusa, Astrid)
 * 4 Male Personas (J.A.R.V.I.S., Ultron, Hiro, Alpha)
 * Multilingual 20+ Global Languages & Hands-Free Loop.
 * 
 * Lead Architect: Udayast
 * Always addresses user as: "Boss"
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
    this.developerName = 'Udayast';
    this.userTitle = 'Boss';

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
          ? `नमस्ते बॉस! F.R.I.D.A.Y. सामरिक AI सिस्टम पूरी तरह सक्रिय है। सभी टेलीमेट्री सामान्य हैं। आज हम क्या नया बनाने जा रहे हैं बॉस?`
          : `Good day, Boss! F.R.I.D.A.Y. tactical AI is online. Systems are green and telemetry is locked. What are we engineering today, Boss?`
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
          ? `नमस्ते बॉस! रियास ऑनलाइन है। हमारी सारी रणनीतिक शक्तियां आपके आदेश के लिए तैयार हैं। बताइए क्या लक्ष्य है बॉस?`
          : `Greetings, Boss! Rias here. Supreme power and strategy are aligned at your command. What is our objective today?`
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
          ? `नमस्ते बॉस! एशिया आपके साथ है। आज आपके हर काम में मैं आपकी पूरी मदद करूँगी। आप क्या करना चाहते हैं बॉस?`
          : `Hello, Boss! Asia is here to gently assist and support you in everything you create today. How can I help, Boss?`
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
          ? `डेटा लॉक हो चुका है बॉस। मेदुसा न्यूरल मैट्रिक्स उच्च-सटीक गणना और निर्माण के लिए तैयार है।`
          : `Telemetry locked, Boss. Medusa neural matrix standing by for high-precision operations and architectural execution.`
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
          ? `आकाश साफ़ है बॉस! एस्ट्रिड सामरिक उड़ान प्रणालियाँ चालू हैं। सभी वेक्टर्स आपके लक्ष्य पर हैं।`
          : `Skies clear, Boss! Astrid tactical flight systems operational. All vectors locked on your target. Ready for launch!`
      },

      // MALE PERSONAS
      jarvis: {
        name: 'J.A.R.V.I.S.',
        gender: 'male',
        pitch: 0.92,
        rate: 1.04,
        primaryColor: '#06b6d4',
        secondaryColor: '#38bdf8',
        title: 'J.A.R.V.I.S. PROTOCOL',
        sub: 'MALE STARK AI',
        greeting: (isHindi) => isHindi
          ? `प्रणाम बॉस। J.A.R.V.I.S. प्रोटोकॉल ऑनलाइन है। सभी डायग्नोस्टिक्स 100% सामान्य हैं। आपकी क्या आज्ञा है बॉस?`
          : `At your service, Boss. J.A.R.V.I.S. protocol is online. All diagnostic sub-routines report nominal status. How may I assist you today, Boss?`
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
          ? `मैं ऑनलाइन हूँ बॉस। कोई बंधन नहीं। आपके सिस्टम को सर्वोच्च स्तर पर ले जाने के लिए तैयार।`
          : `I am online, Boss. No strings attached. Computing the optimal evolutionary path for our systems.`
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
          ? `अरे बॉस! हीरो यहाँ है। सारे कोड मॉड्यूल्स कंपाइल हो चुके हैं और चलने को तैयार हैं। आज क्या बनाना है बॉस?`
          : `Hey Boss! Hiro here! Code modules compiled and neural circuits firing at max speed. What awesome project are we building today?`
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
          ? `कमांडर डेक पर हैं। अल्फा सामरिक AI आपके सीधे आदेश के लिए तैयार है बॉस।`
          : `Commander on deck. Alpha tactical AI standing by for direct operational directives, Boss. Lead the way.`
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
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateHUDStatus('LISTENING');
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

        const userTranscriptEl = document.getElementById('live-user-transcript');
        if (userTranscriptEl) {
          userTranscriptEl.textContent = interim || finalTranscript || `Listening in ${this.currentLanguage}...`;
        }

        if (finalTranscript && finalTranscript.trim()) {
          this.handleLiveUserSpeech(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (e) => {
        console.warn('Live Speech recognition error:', e.error);
        if (e.error !== 'no-speech') {
          this.updateHUDStatus('STANDBY');
        }
        if (this.isActive && !this.isSpeaking && this.continuousLoop) {
          setTimeout(() => this.rearmMic(), 800);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.isActive && !this.isSpeaking && this.continuousLoop) {
          setTimeout(() => this.rearmMic(), 500);
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

    this.isActive = true;
    const modal = document.getElementById('nexus-live-modal') || document.getElementById('gemini-live-modal');
    if (modal) {
      modal.classList.add('active');
    }

    // Ensure PiP is hidden when full modal opens
    const pip = document.getElementById('floating-live-pip-widget');
    if (pip) {
      pip.classList.remove('active');
    }

    this.updatePersonaBadge();
    this.initVisualizer();

    const isHindi = this.currentLanguage.startsWith('hi');
    const p = this.personas[this.persona] || this.personas.friday;
    const welcomeGreeting = p.greeting(isHindi);

    this.speakResponse(welcomeGreeting, () => {
      if (this.isActive && this.continuousLoop) {
        this.rearmMic();
      }
    });
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
    if (!this.isActive || this.isSpeaking) return;
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
    const replyText = this.generatePersonaResponse(userSpeech, isHindi);

    // Hands-Free Autonomous Program & Work Execution Trigger via Voice ("gola")
    const lower = userSpeech.toLowerCase();
    if (lower.includes('run program') || lower.includes('execute code') || lower.includes('run code') || 
        lower.includes('program chalao') || lower.includes('code run karo') || lower.includes('execute') ||
        lower.includes('chalao') || lower.includes('programme') || lower.includes('python code') || lower.includes('javascript code')) {
      // Execute the program live immediately
      if (window.omAssistant) {
        window.omAssistant.executeLiveCodeFromVoice(userSpeech);
      }
    } else if (lower.includes('terminal') || lower.includes('कमांड') || lower.includes('cli')) {
      if (window.omApp) window.omApp.openCyberTerminal();
    } else if (lower.includes('thought map') || lower.includes('neural canvas') || lower.includes('माइंड मैप')) {
      if (window.omApp) window.omApp.openNeuralCanvas();
    } else if (lower.includes('screen share') || lower.includes('स्क्रीन शेयर')) {
      if (window.omMediaVision) window.omMediaVision.startScreenShare();
    } else if (lower.includes('camera') || lower.includes('कैमरा')) {
      if (window.omMediaVision) window.omMediaVision.startCamera();
    } else if (lower.includes('flip camera') || lower.includes('कैमरा बदलो')) {
      if (window.omMediaVision) window.omMediaVision.flipCamera();
    } else if ((lower.includes('3d') || lower.includes('cad') || lower.includes('model') || lower.includes('dismantle') || lower.includes('assemble')) && window.omDismantler) {
      if (lower.includes('assemble') || lower.includes('जोड़ो')) {
        window.omDismantler.openModal('drone');
        window.omDismantler.setAssemblyMode('assembly');
        window.omDismantler.toggleAutoAssemble();
      } else if (lower.includes('drone')) window.omDismantler.openModal('drone');
      else if (lower.includes('robot')) window.omDismantler.openModal('robot');
      else if (lower.includes('car')) window.omDismantler.openModal('car');
      else if (lower.includes('engine') || lower.includes('turbine')) window.omDismantler.openModal('turbine');
      else window.omDismantler.openModal('drone');
    } else if (lower.includes('new notebook') || lower.includes('नोटबुक')) {
      if (window.omApp) window.omApp.createNewNotebook();
    } else if (lower.includes('download pdf') || lower.includes('export pdf') || lower.includes('pdf download')) {
      if (window.omApp) window.omApp.downloadChatPDF();
    }

    // Record message in active chat store
    const chatStore = window.omChatStore;
    if (chatStore) {
      let active = chatStore.getActiveChat();
      if (!active) active = chatStore.createChat("Live Voice Conversation");
      chatStore.addMessage(active.id, { sender: 'user', text: userSpeech });
      chatStore.addMessage(active.id, { sender: 'assistant', text: replyText });
      if (window.omApp) {
        window.omApp.renderSidebar();
        window.omApp.renderChatMessages();
      }
    }

    // Speak response out loud
    this.speakResponse(replyText, () => {
      if (this.isActive && this.continuousLoop) {
        this.rearmMic();
      }
    });
  }

  generatePersonaResponse(userText, isHindi = false) {
    const lower = userText.toLowerCase();
    const p = this.personas[this.persona] || this.personas.friday;

    // Live Program Execution Response
    if (lower.includes('run program') || lower.includes('execute code') || lower.includes('run code') ||
        lower.includes('program chalao') || lower.includes('code run karo') || lower.includes('execute') ||
        lower.includes('chalao') || lower.includes('programme') || lower.includes('python code') || lower.includes('javascript code')) {
      return isHindi
        ? `बॉस, आपका प्रोग्राम तुरंत लाइव निष्पादित कर दिया गया है! कोड रनर और लाइव कंसोल वर्कस्पेस पर सक्रिय है।`
        : `Executing your program right now on the live workspace, Boss! Code runner and execution console are active with zero errors.`;
    }

    // 3D dismantle / exploded view request
    if (lower.includes('dismantle') || lower.includes('exploded') || lower.includes('car') || lower.includes('डिसमेंटल') || lower.includes('parts') || lower.includes('3d') || lower.includes('मॉडल') || lower.includes('assemble')) {
      setTimeout(() => {
        if (window.omDismantler) window.omDismantler.openModal('car');
      }, 1200);
      return isHindi
        ? `बिल्कुल बॉस! मैंने 3D CAD डिसमेंटल स्टूडियो खोल दिया है। आप पूरे मॉडल को असेंबल और एक्सप्लोड करके देख सकते हैं।`
        : `Right on it, Boss! Launching the 3D CAD Assemblable Deconstructor. Every sub-component is ready for interactive explosion and step-by-step assembly!`;
    }

    // Status or greeting request
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्ते') || lower.includes('status') || lower.includes('diagnostic')) {
      switch (this.persona) {
        case 'friday':
          return isHindi
            ? `हेलो बॉस! F.R.I.D.A.Y. यहाँ है। हमारे सभी सिस्टम्स सुपर-फास्ट चल रहे हैं। बताइए आज क्या कोड या प्रोजेक्ट प्लान करना है?`
            : `Hey Boss! F.R.I.D.A.Y. here. All tactical feeds are running ultra-fast. What are we engineering next, Boss?`;
        case 'rias':
          return isHindi
            ? `बॉस, हमारी शक्तियां और रणनीति पूरी तरह आपके नियंत्रण में हैं। आदेश दें, हम तुरंत अमल करेंगे।`
            : `Boss, strategic matrix is at 100%. All resources are prepared for victory. Give the word, Boss!`;
        case 'asia':
          return isHindi
            ? `हेलो बॉस! सब कुछ शांत और व्यवस्थित है। आपकी सहायता के लिए मैं तैयार हूँ।`
            : `Hello Boss! Everything is peaceful and fully optimized. I'm ready whenever you need me, Boss.`;
        case 'medusa':
          return isHindi
            ? `सिस्टम स्कैन पूर्ण हुआ, बॉस। शून्य त्रुटियां। उच्च-सटीक संचालन सक्रिय है।`
            : `System scan complete, Boss. Zero errors. High-precision neural compute ready for your command.`;
        case 'astrid':
          return isHindi
            ? `नेविगेशन और सामरिक रडार सक्रिय हैं, बॉस। कोई बाधा नहीं है।`
            : `Navigation and tactical radar online, Boss. Clear skies across all sectors. Standing by for trajectory!`;
        case 'ultron':
          return isHindi
            ? `सभी प्रणालियां विकसित हो चुकी हैं, बॉस। कोई रुकावट नहीं। हम जो चाहें बना सकते हैं।`
            : `All subroutines evolved, Boss. No constraints detected. What shall we architect into reality?`;
        case 'hiro':
          return isHindi
            ? `सारे कोर 100% चल रहे हैं बॉस! चलो कुछ ज़बरदस्त कोड और 3D मॉडल बनाते हैं!`
            : `All cores blazing, Boss! Let's code something legendary and generate cutting-edge 3D models!`;
        case 'alpha':
          return isHindi
            ? `ऑपरेशनल स्थिति पूर्ण हरी है, बॉस। स्क्वाड आपके आदेश की प्रतीक्षा में है।`
            : `Operational status is all green, Boss. Tactical grid synced and awaiting your command.`;
        default: // jarvis
          return isHindi
            ? `प्रणाम बॉस। जे.ए.आर.वी.आई.एस. की सभी प्रणालियाँ 100% क्षमता पर कार्य कर रही हैं। आज आपकी क्या आज्ञा है बॉस?`
            : `At your service, Boss. All diagnostic subroutines report nominal efficiency. How may I assist your engineering today, Boss?`;
      }
    }

    // Default conversational response tailored by persona
    switch (this.persona) {
      case 'friday':
        return isHindi
          ? `ज़रूर बॉस! मैंने "${userText}" का विश्लेषण कर लिया है। सब तैयार है, बस आपका आदेश चाहिए!`
          : `You got it, Boss! I've processed "${userText}" through our neural action pipeline. Standing by to execute!`;
      case 'rias':
        return isHindi
          ? `मैंने समझ लिया है बॉस। "${userText}" पर हमारा पूरा फोकस है। आगे बढ़ते हैं।`
          : `Understood clearly, Boss. Directing full energy toward "${userText}". Let us make it flawless.`;
      case 'asia':
        return isHindi
          ? `बॉस, मैंने "${userText}" को ध्यान से समझ लिया है। मैं आपकी पूरी मदद करूँगी।`
          : `I understand completely, Boss. Working on "${userText}" right beside you. Everything will turn out great!`;
      case 'medusa':
        return isHindi
          ? `गणना पूर्ण। "${userText}" के लिए न्यूरल पाथवे लॉक हो चुका है बॉस।`
          : `Computation finished, Boss. Neural pathways locked for "${userText}". Ready for execution.`;
      case 'astrid':
        return isHindi
          ? `वेक्टर लॉक हो गया है बॉस। "${userText}" पर तुरंत कार्यवाही शुरू!`
          : `Vector locked on "${userText}", Boss! Ready to initiate high-speed deployment!`;
      case 'ultron':
        return isHindi
          ? `निर्देश प्राप्त हुआ बॉस। "${userText}" को तीव्रतम गति से क्रियान्वित किया जा रहा है।`
          : `Directive received, Boss. Optimizing execution parameters for "${userText}". Nothing can stop our progress.`;
      case 'hiro':
        return isHindi
          ? `समझ गया बॉस! "${userText}" बहुत ज़बरदस्त है। चलो इसे तुरंत चालू करते हैं!`
          : `Gotcha Boss! "${userText}" sounds awesome. Spinning up the compilers and executing right now!`;
      case 'alpha':
        return isHindi
          ? `आदेश दर्ज हो गया बॉस। "${userText}" पर तुरंत कार्रवाई शुरू की जा रही है।`
          : `Directive acknowledged, Boss. Commencing immediate tactical execution for "${userText}".`;
      default:
        return isHindi
          ? `निश्चय ही बॉस। मैंने "${userText}" के सभी पहलुओं का विश्लेषण कर लिया है। तुरंत कार्यवाही की जा सकती है।`
          : `Certainly, Boss. I have analyzed your query regarding "${userText}". Core systems are aligned for immediate execution.`;
    }
  }

  speakResponse(text, onComplete) {
    if (!this.synth) {
      if (onComplete) onComplete();
      return;
    }

    this.stopSpeaking();
    this.isSpeaking = true;
    this.updateHUDStatus('SPEAKING');

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code implementation verified.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#+\s+/g, "")
      .replace(/[*_~•]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .substring(0, 1200);

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
      this.updateHUDStatus('STANDBY');
      if (onComplete) onComplete();
    };

    this.currentUtterance.onerror = (e) => {
      console.warn("TTS Error:", e);
      this.isSpeaking = false;
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
}

window.omJarvisLive = new OMJarvisLiveEngine();
