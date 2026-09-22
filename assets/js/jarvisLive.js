/**
 * OM AI Assistant - Gemini Live & J.A.R.V.I.S. Voice Engine
 * Real-time two-way voice conversation with animated Arc Reactor HUD visualizer,
 * hands-free continuous conversational loop, and Iron Man J.A.R.V.I.S. persona.
 */

class OMJarvisLiveEngine {
  constructor() {
    this.isActive = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.persona = 'jarvis'; // 'jarvis' or 'gemini'
    this.continuousLoop = true;
    this.recognition = null;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.animFrameId = null;
    this.jarvisVoice = null;
    this.audioWaveData = Array(32).fill(10);
    this.developerName = 'Abhishek singh Yadav';

    this.initSpeech();
  }

  initSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

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
          userTranscriptEl.textContent = interim || finalTranscript || "Listening to your voice...";
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

    if (this.synth) {
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize British English male voices for authentic J.A.R.V.I.S. cadence (Paul Bettany style)
    const britishMale = voices.find(v => (v.lang === 'en-GB' || v.lang.startsWith('en_GB')) && (v.name.includes('Male') || v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('Daniel') || v.name.includes('UK English Male')));
    const anyBritish = voices.find(v => v.lang === 'en-GB' || v.lang.startsWith('en_GB'));
    const anyEnglish = voices.find(v => v.lang.startsWith('en'));

    this.jarvisVoice = britishMale || anyBritish || anyEnglish || voices[0] || null;
  }

  startSession(persona = 'jarvis') {
    this.persona = persona;
    this.isActive = true;
    const modal = document.getElementById('gemini-live-modal');
    if (modal) {
      modal.classList.add('active');
    }

    this.updatePersonaBadge();
    this.initVisualizer();

    const welcomeGreeting = this.persona === 'jarvis'
      ? `Good day, Sir. J.A.R.V.I.S. protocol is online and fully synchronized for ${this.developerName}. All systems are operating at peak efficiency. What can I do for you today, Sir?`
      : `Hello! Google Gemini Live voice conversation is active. I'm ready to listen, think, and explore anything with you. What's on your mind?`;

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
    this.persona = this.persona === 'jarvis' ? 'gemini' : 'jarvis';
    this.updatePersonaBadge();
    const switchMsg = this.persona === 'jarvis'
      ? "Switching to J.A.R.V.I.S. Stark Industries protocol, Sir. Telemetry and voice calibration verified."
      : "Switched to Google Gemini Live conversational voice mode.";
    this.speakResponse(switchMsg, () => {
      if (this.isActive) this.rearmMic();
    });
  }

  updatePersonaBadge() {
    const badge = document.getElementById('live-persona-badge');
    const toggleBtn = document.getElementById('btn-toggle-live-persona');
    if (badge) {
      if (this.persona === 'jarvis') {
        badge.innerHTML = `<span style="color: #38bdf8;">⚡ J.A.R.V.I.S. PROTOCOL</span> • <span style="color: #10b981;">STARK HUD ONLINE</span>`;
      } else {
        badge.innerHTML = `<span style="color: #8b5cf6;">✨ GEMINI LIVE VOICE</span> • <span style="color: #06b6d4;">MULTIMODAL</span>`;
      }
    }
    if (toggleBtn) {
      toggleBtn.textContent = this.persona === 'jarvis' ? 'Switch to Gemini Voice' : 'Switch to J.A.R.V.I.S. Voice';
    }
  }

  rearmMic() {
    if (!this.isActive || this.isSpeaking) return;
    if (this.recognition && !this.isListening) {
      try {
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

    // Generate response tailored to J.A.R.V.I.S. or Gemini Live
    if (this.persona === 'jarvis') {
      replyText = this.generateJarvisLiveResponse(userSpeech);
    } else {
      if (assistant) {
        const resp = await assistant.processUserMessage(userSpeech, []);
        replyText = resp && resp.text ? resp.text : "I have processed your request. Let's take action right away.";
      } else {
        replyText = "I hear you clearly. How would you like to proceed?";
      }
    }

    // Also record message in active chat store for session persistence
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

  generateJarvisLiveResponse(userText) {
    const lower = userText.toLowerCase();
    const dev = this.developerName;

    // Check for 3D dismantle request
    if (lower.includes('dismantle') || lower.includes('exploded') || lower.includes('car') || lower.includes('parts') || lower.includes('3d')) {
      setTimeout(() => {
        if (window.omApp && window.omApp.open3DDismantleModal) {
          window.omApp.open3DDismantleModal('car');
        }
      }, 1500);
      return `Right away, Sir. Initiating full CAD exploded decomposition for the high-performance vehicle. Every sub-component—from the twin-turbo powertrain to the carbon-ceramic suspension—is being dismantled in the 3D holographic workspace right now.`;
    }

    // Check for greeting / status
    if (lower.includes('hello') || lower.includes('jarvis') || lower.includes('status') || lower.includes('diagnostic')) {
      return `At your service, Sir. All diagnostic sub-routines report nominal status for ${dev}. Neural latency is under 12 milliseconds, and security encryption is impenetrable. How may I assist your engineering work today, Sir?`;
    }

    // Check for code / execution
    if (lower.includes('code') || lower.includes('python') || lower.includes('build') || lower.includes('agent')) {
      return `Executing autonomous agentic sequence for you, Sir. The cognitive planner has formulated the execution matrix, and the sandbox is primed for immediate synthesis.`;
    }

    // General intelligent Jarvis reply
    return `Certainly, Sir. I have analyzed your query regarding "${userText}". All core subsystems are aligned with your directive, Mr. Yadav. Shall I proceed with immediate automated execution?`;
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

    const jarvisTranscriptEl = document.getElementById('live-jarvis-transcript');
    if (jarvisTranscriptEl) {
      jarvisTranscriptEl.textContent = cleanText;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    if (this.jarvisVoice) {
      this.currentUtterance.voice = this.jarvisVoice;
    }

    // J.A.R.V.I.S. cadence: pitch 0.95, rate 1.05 for confident British butler AI timbre
    this.currentUtterance.pitch = this.persona === 'jarvis' ? 0.95 : 1.0;
    this.currentUtterance.rate = this.persona === 'jarvis' ? 1.04 : 1.0;

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

      // 1. Outer Holographic Energy Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.strokeStyle = this.persona === 'jarvis' ? `rgba(6, 182, 212, ${0.4 * intensity})` : `rgba(139, 92, 246, ${0.4 * intensity})`;
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
        ctx.strokeStyle = this.persona === 'jarvis' ? `rgba(56, 189, 248, ${0.8 * intensity})` : `rgba(236, 72, 153, ${0.8 * intensity})`;
        ctx.lineWidth = 6;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.persona === 'jarvis' ? '#06b6d4' : '#ec4899';
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
        ctx.strokeStyle = this.persona === 'jarvis' ? '#22d3ee' : '#a855f7';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // 4. Glowing Arc Reactor Core
      const corePulse = (Math.sin(angle * 3) + 1) * 4 * intensity;
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 45 + corePulse);
      if (this.persona === 'jarvis') {
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, 'rgba(34, 211, 238, 0.9)');
        gradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.4)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      } else {
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, 'rgba(192, 132, 252, 0.9)');
        gradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 45 + corePulse, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 5. Central Iron Man / Gemini Core Symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.persona === 'jarvis' ? 'JARVIS' : 'GEMINI', centerX, centerY);

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }
}

window.omJarvisLive = new OMJarvisLiveEngine();
