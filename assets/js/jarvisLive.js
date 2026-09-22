/**
 * OM AI Assistant - Gemini Live, J.A.R.V.I.S. & F.R.I.D.A.Y. Voice Engine
 * Universal Multilingual two-way conversation loop with Arc Reactor HUD,
 * Male (J.A.R.V.I.S.) & Female (F.R.I.D.A.Y.) AI personas, and 20+ World Languages.
 */

class OMJarvisLiveEngine {
  constructor() {
    this.isActive = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.persona = localStorage.getItem('om_live_persona') || 'jarvis'; // 'jarvis', 'friday', or 'gemini'
    this.voiceGender = localStorage.getItem('om_voice_gender') || 'male'; // 'male' or 'female'
    this.currentLanguage = localStorage.getItem('om_voice_language') || 'en-US';
    this.continuousLoop = true;
    this.recognition = null;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.animFrameId = null;
    this.developerName = 'Abhishek singh Yadav';

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

  setVoiceGender(gender) {
    this.voiceGender = gender === 'female' ? 'female' : 'male';
    if (this.voiceGender === 'female' && this.persona === 'jarvis') {
      this.persona = 'friday'; // auto-switch to F.R.I.D.A.Y. for female voice
    } else if (this.voiceGender === 'male' && this.persona === 'friday') {
      this.persona = 'jarvis'; // auto-switch to J.A.R.V.I.S. for male voice
    }
    this.updatePersonaBadge();
  }

  setPersona(personaKey) {
    this.persona = personaKey;
    localStorage.setItem('om_live_persona', personaKey);
    if (personaKey === 'friday') {
      this.voiceGender = 'female';
    } else if (personaKey === 'jarvis') {
      this.voiceGender = 'male';
    }
    this.updatePersonaBadge();
  }

  startSession(persona = null) {
    if (persona) {
      this.setPersona(persona);
    }
    this.isActive = true;
    const modal = document.getElementById('gemini-live-modal');
    if (modal) {
      modal.classList.add('active');
    }

    this.updatePersonaBadge();
    this.initVisualizer();

    const isHindi = this.currentLanguage.startsWith('hi');
    let welcomeGreeting = "";

    if (this.persona === 'friday') {
      welcomeGreeting = isHindi
        ? `नमस्ते बॉस! F.R.I.D.A.Y. सामरिक AI सिस्टम पूरी तरह सक्रिय है। ${this.developerName} के लिए सभी पैरामीटर्स ग्रीन हैं। आज हम क्या नया बनाने जा रहे हैं?`
        : `Good day, Boss! F.R.I.D.A.Y. tactical AI is online. Systems are green for Abhishek singh Yadav. What are we engineering today?`;
    } else if (this.persona === 'jarvis') {
      welcomeGreeting = isHindi
        ? `प्रणाम सर। J.A.R.V.I.S. प्रोटोकॉल ऑनलाइन है। ${this.developerName} के लिए सभी डायग्नोस्टिक्स 100% सामान्य हैं। आपकी क्या आज्ञा है सर?`
        : `Good day, Sir. J.A.R.V.I.S. protocol is online and fully synchronized for ${this.developerName}. All systems are operating at peak efficiency. What can I do for you today, Sir?`;
    } else {
      welcomeGreeting = isHindi
        ? `नमस्ते! गूगल जेमिनी लाइव वॉइस मोड सक्रिय है। मैं आपकी हर बात सुनने और काम को पूरा करने के लिए तैयार हूँ।`
        : `Hello! Google Gemini Live voice conversation is active. I'm ready to listen, think, and explore anything with you. What's on your mind?`;
    }

    this.speakResponse(welcomeGreeting, () => {
      if (this.isActive && this.continuousLoop) {
        this.rearmMic();
      }
    });
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

    const modal = document.getElementById('gemini-live-modal');
    if (modal) {
      modal.classList.remove('active');
    }

    if (window.omApp) {
      window.omApp.showToast("Voice conversation session ended.", "info");
    }
  }

  togglePersona() {
    if (this.persona === 'jarvis') {
      this.setPersona('friday');
    } else if (this.persona === 'friday') {
      this.setPersona('gemini');
    } else {
      this.setPersona('jarvis');
    }

    const switchMsg = this.persona === 'friday'
      ? "Switching to F.R.I.D.A.Y. Tactical AI mode, boss! Ready and listening."
      : (this.persona === 'jarvis' ? "Switching to J.A.R.V.I.S. Stark Industries protocol, Sir." : "Switched to Google Gemini Live conversational voice mode.");

    this.speakResponse(switchMsg, () => {
      if (this.isActive) this.rearmMic();
    });
  }

  updatePersonaBadge() {
    const badge = document.getElementById('live-persona-badge');
    const toggleBtn = document.getElementById('btn-toggle-live-persona');
    if (badge) {
      if (this.persona === 'friday') {
        badge.innerHTML = `<span style="color: #ec4899;">👩 F.R.I.D.A.Y. AI</span> • <span style="color: #10b981;">FEMALE TACTICAL HUD</span>`;
      } else if (this.persona === 'jarvis') {
        badge.innerHTML = `<span style="color: #38bdf8;">👨 J.A.R.V.I.S. AI</span> • <span style="color: #06b6d4;">MALE STARK PROTOCOL</span>`;
      } else {
        badge.innerHTML = `<span style="color: #8b5cf6;">✨ GEMINI LIVE</span> • <span style="color: #a855f7;">MULTIMODAL VOICE</span>`;
      }
    }
    if (toggleBtn) {
      if (this.persona === 'jarvis') toggleBtn.textContent = 'Switch to F.R.I.D.A.Y. (Female)';
      else if (this.persona === 'friday') toggleBtn.textContent = 'Switch to Gemini Voice';
      else toggleBtn.textContent = 'Switch to J.A.R.V.I.S. (Male)';
    }
  }

  rearmMic() {
    if (!this.isActive || this.isSpeaking) return;
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.lang = this.currentLanguage;
        this.recognition.start();
      } catch (e) {
        // Recognition might already be running
      }
    }
  }

  async handleLiveUserSpeech(userSpeech) {
    if (!this.isActive) return;
    this.updateHUDStatus('PROCESSING');

    // Update Live Transcript
    const userTranscriptEl = document.getElementById('live-user-transcript');
    if (userTranscriptEl) {
      userTranscriptEl.textContent = `"${userSpeech}"`;
    }

    const assistant = window.omAssistant;
    const chatStore = window.omChatStore;
    let replyText = "";

    const isHindi = this.currentLanguage.startsWith('hi');

    if (this.persona === 'friday') {
      replyText = this.generateFridayLiveResponse(userSpeech, isHindi);
    } else if (this.persona === 'jarvis') {
      replyText = this.generateJarvisLiveResponse(userSpeech, isHindi);
    } else {
      if (assistant) {
        const resp = await assistant.processUserMessage(userSpeech, []);
        replyText = resp && resp.text ? resp.text : (isHindi ? "मैंने आपकी बात समझ ली है। आगे बढ़ते हैं।" : "I hear you clearly. Let's take action right away.");
      } else {
        replyText = isHindi ? "मैं तैयार हूँ। बताएं क्या करना है?" : "I hear you clearly. How would you like to proceed?";
      }
    }

    // Record message in active chat store
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

  generateFridayLiveResponse(userText, isHindi = false) {
    const lower = userText.toLowerCase();

    // 3D dismantle request
    if (lower.includes('dismantle') || lower.includes('exploded') || lower.includes('car') || lower.includes('डिसमेंटल') || lower.includes('parts')) {
      setTimeout(() => {
        if (window.omDismantler) window.omDismantler.openModal('car');
      }, 1500);
      return isHindi
        ? `बिल्कुल बॉस! मैंने हाई-परफॉरमेंस कार का पूरा 3D CAD एक्सप्लोडेड व्यू लोड कर दिया है। आप हर एक पार्ट को अलग-अलग देख सकते हैं।`
        : `Right on it, Boss! I've loaded up the complete 3D exploded CAD decomposition for the vehicle. Every part is mapped out on your holographic display now.`;
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्ते') || lower.includes('status')) {
      return isHindi
        ? `हेलो बॉस! F.R.I.D.A.Y. यहाँ है। ${this.developerName} के सभी सिस्टम्स सुपर-फास्ट चल रहे हैं। बताइए आज क्या कोड या प्रोजेक्ट प्लान करना है?`
        : `Hey Boss! F.R.I.D.A.Y. here. All tactical feeds are running ultra-fast for ${this.developerName}. What are we tackling next?`;
    }

    return isHindi
      ? `ज़रूर बॉस! मैंने "${userText}" का पूरा विश्लेषण कर लिया है। सब कुछ तैयार है, बताइए आगे का क्या कदम उठाना है?`
      : `You got it, Boss! I've processed "${userText}" through our neural action pipeline. Everything is set to execute whenever you say the word!`;
  }

  generateJarvisLiveResponse(userText, isHindi = false) {
    const lower = userText.toLowerCase();
    const dev = this.developerName;

    // Check for 3D dismantle request
    if (lower.includes('dismantle') || lower.includes('exploded') || lower.includes('car') || lower.includes('डिसमेंटल') || lower.includes('parts')) {
      setTimeout(() => {
        if (window.omDismantler) window.omDismantler.openModal('car');
      }, 1500);
      return isHindi
        ? `आज्ञा का पालन होगा सर। वाहन के सभी यांत्रिक और संरचनात्मक 3D पार्ट्स को अलग-अलग करके होलोग्राफिक डिस्प्ले पर प्रदर्शित किया जा रहा है।`
        : `Right away, Sir. Initiating full CAD exploded decomposition for the high-performance vehicle. Every sub-component is being dismantled in the 3D holographic workspace.`;
    }

    if (lower.includes('hello') || lower.includes('jarvis') || lower.includes('नमस्ते') || lower.includes('status') || lower.includes('diagnostic')) {
      return isHindi
        ? `प्रणाम सर। ${dev} के लिए जे.ए.आर.वी.आई.एस. की सभी प्रणालियाँ 100% क्षमता पर कार्य कर रही हैं। आज आपकी क्या आज्ञा है सर?`
        : `At your service, Sir. All diagnostic sub-routines report nominal status for ${dev}. Neural latency is under 12 milliseconds. How may I assist your engineering work today, Sir?`;
    }

    return isHindi
      ? `निश्चय ही सर। मैंने "${userText}" के सभी तकनीकी पहलुओं का विश्लेषण कर लिया है। आपके आदेशानुसार तुरंत कार्यवाही की जा सकती है।`
      : `Certainly, Sir. I have analyzed your query regarding "${userText}". All core subsystems are aligned with your directive, Mr. Yadav. Shall I proceed with immediate execution?`;
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

    const speakerTag = document.querySelector('.transcript-speaker-tag.jarvis-tag');
    if (speakerTag) {
      speakerTag.textContent = this.persona === 'friday' ? 'F.R.I.D.A.Y.:' : (this.persona === 'jarvis' ? 'J.A.R.V.I.S.:' : 'GEMINI:');
      speakerTag.style.background = this.persona === 'friday' ? 'linear-gradient(135deg, #ec4899, #10b981)' : 'linear-gradient(135deg, #06b6d4, #6366f1)';
    }

    const jarvisTranscriptEl = document.getElementById('live-jarvis-transcript');
    if (jarvisTranscriptEl) {
      jarvisTranscriptEl.textContent = cleanText;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.lang = this.currentLanguage;

    // Use VoiceEngine helper to find matching voice
    if (window.omVoice && window.omVoice.findBestVoice) {
      const best = window.omVoice.findBestVoice(this.currentLanguage, this.voiceGender);
      if (best) this.currentUtterance.voice = best;
    }

    // Gender calibration
    if (this.voiceGender === 'female' || this.persona === 'friday') {
      this.currentUtterance.pitch = 1.15; // Energetic, bright F.R.I.D.A.Y. timbre
      this.currentUtterance.rate = 1.05;
    } else {
      this.currentUtterance.pitch = 0.94; // Resonant British J.A.R.V.I.S. timbre
      this.currentUtterance.rate = 1.04;
    }

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
    if (statusTextEl) {
      statusTextEl.textContent = status;
      if (status === 'LISTENING') statusTextEl.style.color = '#38bdf8';
      else if (status === 'SPEAKING') statusTextEl.style.color = '#10b981';
      else if (status === 'PROCESSING') statusTextEl.style.color = '#f59e0b';
      else statusTextEl.style.color = '#94a3b8';
    }
    if (pulseRing) {
      pulseRing.className = 'live-hud-pulse-ring ' + status.toLowerCase();
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

      // Color Theme by Persona
      let primaryColor = '#06b6d4';
      let secondaryColor = '#38bdf8';
      let tagLabel = 'JARVIS';

      if (this.persona === 'friday') {
        primaryColor = '#ec4899';
        secondaryColor = '#10b981';
        tagLabel = 'FRIDAY';
      } else if (this.persona === 'gemini') {
        primaryColor = '#8b5cf6';
        secondaryColor = '#c084fc';
        tagLabel = 'GEMINI';
      }

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

      // 5. Central Iron Man / F.R.I.D.A.Y. Core Symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagLabel, centerX, centerY);

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }
}

window.omJarvisLive = new OMJarvisLiveEngine();
