/**
 * OM AI Assistant - Voice Engine (Universal Multilingual & Dual Male/Female Voices)
 * Supports 20+ Global World Languages, Speech-to-Text Recognition,
 * Male/Female Voice Synthesis with Pitch/Cadence modulation, and Hands-free Dictation.
 */

class OMVoiceEngine {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.isStarting = false;
    this._lastToggleTime = 0;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.isPlayingTTS = false;
    this.activeTTSMsgId = null;

    this.currentLanguage = localStorage.getItem('om_voice_language') || 'en-US';
    this.voiceGender = localStorage.getItem('om_voice_gender') || 'male'; // 'male' or 'female'

    this.supportedLanguages = {
      'en-US': { name: 'English (US)', flag: '🇺🇸' },
      'hi-IN': { name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
      'en-GB': { name: 'English (UK)', flag: '🇬🇧' },
      'en-IN': { name: 'English (India)', flag: '🇮🇳' },
      'es-ES': { name: 'Español (Spanish)', flag: '🇪🇸' },
      'fr-FR': { name: 'Français (French)', flag: '🇫🇷' },
      'de-DE': { name: 'Deutsch (German)', flag: '🇩🇪' },
      'ja-JP': { name: '日本語 (Japanese)', flag: '🇯🇵' },
      'zh-CN': { name: '中文 (Mandarin)', flag: '🇨🇳' },
      'ar-SA': { name: 'العربية (Arabic)', flag: '🇸🇦' },
      'ru-RU': { name: 'Русский (Russian)', flag: '🇷🇺' },
      'pt-BR': { name: 'Português (Portuguese)', flag: '🇧🇷' },
      'bn-IN': { name: 'বাংলা (Bengali)', flag: '🇮🇳' },
      'ta-IN': { name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
      'te-IN': { name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
      'mr-IN': { name: 'मराठी (Marathi)', flag: '🇮🇳' },
      'ko-KR': { name: '한국어 (Korean)', flag: '🇰🇷' },
      'it-IT': { name: 'Italiano (Italian)', flag: '🇮🇹' },
      'nl-NL': { name: 'Nederlands (Dutch)', flag: '🇳🇱' },
      'tr-TR': { name: 'Türkçe (Turkish)', flag: '🇹🇷' }
    };

    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;

      this.lastSpokenText = '';

      this.recognition.onstart = () => {
        this.isStarting = false;
        this.isRecording = true;
        this.lastSpokenText = '';
        this.updateVisualState(true, 'listening');
      };

      this.recognition.onspeechend = () => {
        // Immediate termination on silence to trigger prompt generation with zero delay
        try {
          this.recognition.stop();
        } catch (e) {}
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

        if (finalTranscript) {
          this.lastSpokenText = (this.lastSpokenText ? this.lastSpokenText + ' ' : '') + finalTranscript.trim();
        }

        const currentDisplay = this.lastSpokenText ? (interim ? this.lastSpokenText + ' ' + interim : this.lastSpokenText) : interim;
        const input = document.getElementById('chat-user-input');
        if (input && currentDisplay) {
          input.value = currentDisplay;
        }

        const pulseText = document.getElementById('voice-transcript-preview');
        if (pulseText) {
          pulseText.textContent = interim || this.lastSpokenText || `Listening in ${this.getLanguageDisplayName()}...`;
        }
      };

      this.recognition.onerror = (e) => {
        this.isStarting = false;
        this.isRecording = false;
        console.warn("Speech recognition notice:", e.error);
        this.stopRecording();
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          if (window.omApp) {
            window.omApp.showToast("Microphone permission was denied. Please allow microphone access in your browser settings.", "error");
          }
        } else if (e.error === 'no-speech') {
          if (window.omApp) {
            window.omApp.showToast("No speech detected. Please speak into your microphone.", "info");
          }
        } else if (e.error === 'audio-capture') {
          if (window.omApp) {
            window.omApp.showToast("No microphone was detected on your device.", "error");
          }
        } else if (e.error === 'network') {
          if (window.omApp) {
            window.omApp.showToast("Speech recognition network error. Check your connection.", "error");
          }
        } else if (e.error !== 'aborted') {
          if (window.omApp) {
            window.omApp.showToast(`Microphone notice: ${e.error}. Please try again.`, "info");
          }
        }
      };

      this.recognition.onend = () => {
        this.isStarting = false;
        this.isRecording = false;
        const input = document.getElementById('chat-user-input');
        const spoken = (this.lastSpokenText || (input ? input.value : '') || '').trim();
        this.updateVisualState(false);
        if (spoken.length > 0) {
          this.lastSpokenText = '';
          if (window.omApp && typeof window.omApp.sendVoiceCommand === 'function') {
            window.omApp.sendVoiceCommand(spoken);
          }
        }
      };
    }
  }

  setLanguage(langCode) {
    if (this.supportedLanguages[langCode]) {
      this.currentLanguage = langCode;
      localStorage.setItem('om_voice_language', langCode);
      if (this.recognition) {
        this.recognition.lang = langCode;
      }
      if (window.omJarvisLive) {
        window.omJarvisLive.setLanguage(langCode);
      }
      if (window.omApp) {
        window.omApp.updateLanguageUI(langCode);
        window.omApp.showToast(`Voice & Language set to ${this.supportedLanguages[langCode].flag} ${this.supportedLanguages[langCode].name}`, 'info');
      }
    }
  }

  setVoiceGender(gender) {
    this.voiceGender = gender === 'female' ? 'female' : 'male';
    localStorage.setItem('om_voice_gender', this.voiceGender);
    if (window.omJarvisLive) {
      window.omJarvisLive.setVoiceGender(this.voiceGender);
    }
    if (window.omApp) {
      window.omApp.updateVoiceGenderUI(this.voiceGender);
      window.omApp.showToast(`Voice set to ${this.voiceGender === 'female' ? '👩 Female (F.R.I.D.A.Y. / Athena)' : '👨 Male (J.A.R.V.I.S. / Apollo)'}`, 'success');
    }
  }

  getLanguageDisplayName() {
    return this.supportedLanguages[this.currentLanguage]?.name || this.currentLanguage;
  }

  toggleRecording() {
    const now = Date.now();
    if (this._lastToggleTime && (now - this._lastToggleTime < 350)) {
      return; // Debounce rapid multi-clicks
    }
    this._lastToggleTime = now;

    if (!this.recognition) {
      if (window.omApp) {
        window.omApp.showToast("Voice dictation is not supported in this browser. Please use Chrome, Edge, or a browser with Web Speech API support.", "info");
      }
      return;
    }

    if (this.isRecording || this.isStarting) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    // Interrupt any ongoing AI speech immediately (Barge-in / Interruptibility)
    if (this.isPlayingTTS) {
      this.stopSpeaking();
    }
    if (!this.recognition || this.isRecording || this.isStarting) {
      return;
    }
    this.isStarting = true;
    try {
      this.recognition.lang = this.currentLanguage;
      this.recognition.start();
    } catch (e) {
      this.isStarting = false;
      if (e.name === 'InvalidStateError') {
        // Recognition already running in browser
        this.isRecording = true;
        this.updateVisualState(true, 'listening');
      } else {
        console.warn("Recognition start notice:", e);
      }
    }
  }

  stopRecording() {
    this.isStarting = false;
    this.isRecording = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.updateVisualState(false);
  }

  updateVisualState(recording, state = 'listening') {
    const voiceBtn = document.getElementById('btn-voice-input');
    const visualizer = document.getElementById('voice-visualizer-bar');
    const orb = document.getElementById('om-voice-orb');
    const preview = document.getElementById('voice-transcript-preview');

    if (voiceBtn) {
      voiceBtn.classList.toggle('recording', recording);
      voiceBtn.innerHTML = recording ? '<span class="mic-orb-circle"></span>' : '';
    }
    if (visualizer) {
      visualizer.style.display = recording ? 'flex' : 'none';
      if (recording) {
        visualizer.setAttribute('data-state', state);
      }
    }
    if (orb) {
      orb.setAttribute('data-state', state);
    }
    const miniOrb = document.getElementById('orb-widget-mini');
    if (miniOrb) {
      if (recording || state === 'speaking') {
        miniOrb.classList.add('active');
        miniOrb.style.display = 'flex';
      } else {
        miniOrb.classList.remove('active');
        miniOrb.style.display = 'none';
      }
      miniOrb.classList.toggle('speaking', state === 'speaking');
    }
    if (preview && !recording) {
      preview.textContent = `Listening in ${this.getLanguageDisplayName()}...`;
    }
  }

  findBestVoice(langCode, gender) {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const langPrefix = (langCode || 'en-US').split('-')[0].toLowerCase();

    // 1. Filter voices for language
    const langVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
    const targetPool = langVoices.length > 0 ? langVoices : voices;

    const femaleKeywords = [
      'female', 'woman', 'zira', 'samantha', 'kavya', 'swara', 'priya', 'victoria',
      'eva', 'yuna', 'amelie', 'anna', 'monica', 'heera', 'kalpana', 'geeta', 'sunita',
      'ayumi', 'haruka', 'sayaka', 'karen', 'tessa', 'sangeeta', 'veena', 'alice',
      'fiona', 'helena', 'sara', 'lucia', 'laura', 'stephanie', 'catherine', 'mary',
      'cortana', 'google हिन्दी', 'google us english'
    ];

    const maleKeywords = [
      'male', 'man', 'david', 'george', 'daniel', 'oliver', 'rishi', 'alex',
      'guy', 'stefan', 'thomas', 'madhur', 'ravi', 'hemant', 'mark', 'james',
      'richard', 'john', 'cosimo', 'nicolas'
    ];

    if (gender === 'female') {
      // Prioritize explicit female match in target language
      const fMatch = targetPool.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (fMatch) return fMatch;
      // Filter out known male names
      const nonMale = targetPool.filter(v => !maleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (nonMale.length > 0) return nonMale[0];
      // Fallback to any global female voice
      const globalFemale = voices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (globalFemale) return globalFemale;
      return targetPool[0];
    } else {
      // Prioritize explicit male match
      const mMatch = targetPool.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (mMatch) return mMatch;
      const nonFemale = targetPool.filter(v => !femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (nonFemale.length > 0) return nonFemale[0];
      return targetPool[0];
    }
  }

  speakText(text, msgId = null) {
    if (!this.synth) {
      if (window.omApp) window.omApp.showToast("Speech synthesis not supported in this browser.", "info");
      return;
    }

    // If currently speaking this message, toggle stop
    if (this.isPlayingTTS && this.activeTTSMsgId === msgId) {
      this.stopSpeaking();
      return;
    }

    this.stopSpeaking();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code implementation omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#+\s+/g, "")
      .replace(/[*_~•]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .substring(0, 1500);

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.lang = this.currentLanguage;

    const matchedVoice = this.findBestVoice(this.currentLanguage, this.voiceGender);
    if (matchedVoice) {
      this.currentUtterance.voice = matchedVoice;
    }

    // Adjust pitch & rate based on gender
    if (this.voiceGender === 'female') {
      this.currentUtterance.pitch = 1.22; // High-definition, bright, distinctly female
      this.currentUtterance.rate = 1.05;
    } else {
      this.currentUtterance.pitch = 0.92; // Deep, confident male resonance
      this.currentUtterance.rate = 1.04;
    }

    this.currentUtterance.onstart = () => {
      this.isPlayingTTS = true;
      this.activeTTSMsgId = msgId;
      this.updateTTSButtonState(msgId, true);
      this.updateVisualState(true, 'speaking');
      const preview = document.getElementById('voice-transcript-preview');
      if (preview) preview.textContent = "AI speaking response...";
    };

    this.currentUtterance.onend = () => {
      this.isPlayingTTS = false;
      this.updateTTSButtonState(msgId, false);
      this.activeTTSMsgId = null;
      this.updateVisualState(false);
    };

    this.currentUtterance.onerror = () => {
      this.isPlayingTTS = false;
      this.updateTTSButtonState(msgId, false);
      this.activeTTSMsgId = null;
      this.updateVisualState(false);
    };

    this.synth.speak(this.currentUtterance);
  }

  speakMessageById(msgId) {
    if (!window.omChatStore) return;
    const active = window.omChatStore.getActiveChat();
    if (!active || !active.messages) return;
    const msg = active.messages.find(m => m.id === msgId);
    if (msg && msg.text) {
      this.speakText(msg.text, msg.id);
    }
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlayingTTS = false;
      if (this.activeTTSMsgId) {
        this.updateTTSButtonState(this.activeTTSMsgId, false);
        this.activeTTSMsgId = null;
      }
      this.updateVisualState(false);
    }
  }

  updateTTSButtonState(msgId, isPlaying) {
    if (!msgId) return;
    const btn = document.querySelector(`[data-tts-id="${msgId}"]`);
    if (btn) {
      btn.innerHTML = isPlaying ? '⏹️ Stop' : '🔊 Listen';
      btn.classList.toggle('playing', isPlaying);
    }
  }

  // =========================================================================
  // Custom AI Voice Profiles System (Specification 34 & 35)
  // =========================================================================
  getDefaultVoiceProfiles() {
    return [
      {
        id: 'voice-jarvis',
        name: 'J.A.R.V.I.S.',
        provider: 'Stark Neural Engine',
        providerId: 'stark-jarvis-01',
        language: 'en-GB',
        style: 'Tactical Resonant Baritone',
        gender: 'male',
        pitch: 0.92,
        rate: 1.04,
        enabled: true
      },
      {
        id: 'voice-ultron',
        name: 'Ultron',
        provider: 'Neural Apex Synth',
        providerId: 'apex-ultron-02',
        language: 'en-US',
        style: 'Metallic Deep Baritone',
        gender: 'male',
        pitch: 0.75,
        rate: 0.95,
        enabled: true
      },
      {
        id: 'voice-hiro',
        name: 'Hiro',
        provider: 'Tech Prodigy Core',
        providerId: 'tech-hiro-03',
        language: 'en-US',
        style: 'Energetic Technical',
        gender: 'male',
        pitch: 1.08,
        rate: 1.08,
        enabled: true
      },
      {
        id: 'voice-alpha',
        name: 'Alpha',
        provider: 'Commander Tactical Engine',
        providerId: 'tactical-alpha-04',
        language: 'en-US',
        style: 'Decisive Commander',
        gender: 'male',
        pitch: 0.85,
        rate: 1.0,
        enabled: true
      },
      {
        id: 'voice-onyx',
        name: 'Onyx',
        provider: 'Cyber Precision Core',
        providerId: 'cyber-onyx-05',
        language: 'en-US',
        style: 'Calm Analytical Baritone',
        gender: 'male',
        pitch: 0.82,
        rate: 0.98,
        enabled: true
      },
      {
        id: 'voice-atlas',
        name: 'Atlas',
        provider: 'Edge Neural Core',
        providerId: 'edge-atlas-06',
        language: 'en-US',
        style: 'Deep Authoritative',
        gender: 'male',
        pitch: 0.88,
        rate: 0.96,
        enabled: true
      },
      {
        id: 'voice-friday',
        name: 'F.R.I.D.A.Y.',
        provider: 'Stark Tactical Intelligence',
        providerId: 'stark-friday-07',
        language: 'en-IE',
        style: 'Crisp Analytical',
        gender: 'female',
        pitch: 1.22,
        rate: 1.05,
        enabled: true
      },
      {
        id: 'voice-rias',
        name: 'Rias',
        provider: 'Crimson Strategic Voice',
        providerId: 'crimson-rias-08',
        language: 'en-US',
        style: 'Warm Strategic Leadership',
        gender: 'female',
        pitch: 1.15,
        rate: 1.02,
        enabled: true
      },
      {
        id: 'voice-asia',
        name: 'Asia',
        provider: 'Harmonic Seraph Engine',
        providerId: 'seraph-asia-09',
        language: 'en-US',
        style: 'Gentle Supportive Cadence',
        gender: 'female',
        pitch: 1.28,
        rate: 0.98,
        enabled: true
      },
      {
        id: 'voice-medusa',
        name: 'Medusa',
        provider: 'Cyber Neural Matrix',
        providerId: 'matrix-medusa-10',
        language: 'en-US',
        style: 'High-Precision Analytical',
        gender: 'female',
        pitch: 1.10,
        rate: 1.02,
        enabled: true
      },
      {
        id: 'voice-astrid',
        name: 'Astrid',
        provider: 'Tactical Valkyrie Voice',
        providerId: 'valkyrie-astrid-11',
        language: 'en-US',
        style: 'Fast Tactical Flight Cadence',
        gender: 'female',
        pitch: 1.22,
        rate: 1.08,
        enabled: true
      },
      {
        id: 'voice-samantha',
        name: 'Samantha',
        provider: 'Natural Conversational Matrix',
        providerId: 'natural-samantha-12',
        language: 'en-US',
        style: 'Warm Conversational Empathy',
        gender: 'female',
        pitch: 1.18,
        rate: 1.0,
        enabled: true
      },
      {
        id: 'voice-nova',
        name: 'Nova Pro',
        provider: 'Google Neural Core',
        providerId: 'google-nova-13',
        language: 'en-US',
        style: 'Fast Conversational',
        gender: 'female',
        pitch: 1.25,
        rate: 1.05,
        enabled: true
      },
      {
        id: 'voice-echo',
        name: 'Echo',
        provider: 'Natural Flow Engine',
        providerId: 'flow-echo-14',
        language: 'en-US',
        style: 'Balanced Smooth',
        gender: 'female',
        pitch: 1.05,
        rate: 1.0,
        enabled: true
      },
      {
        id: 'voice-aarya',
        name: 'Aarya',
        provider: 'Indo-Neural Synth',
        providerId: 'indo-aarya-15',
        language: 'hi-IN',
        style: 'Natural Hindi Cadence',
        gender: 'female',
        pitch: 1.15,
        rate: 1.0,
        enabled: true
      }
    ];
  }

  getVoiceProfiles() {
    const raw = localStorage.getItem('om_custom_voice_profiles');
    if (raw) {
      try {
        const parsed = jsonParse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        try { return JSON.parse(raw); } catch (err) {}
      }
    }
    const def = this.getDefaultVoiceProfiles();
    localStorage.setItem('om_custom_voice_profiles', JSON.stringify(def));
    return def;
  }

  saveVoiceProfiles(profiles) {
    localStorage.setItem('om_custom_voice_profiles', JSON.stringify(profiles));
  }

  addCustomVoiceProfile(profile) {
    const profiles = this.getVoiceProfiles();
    const newId = profile.id || `voice-${Date.now()}`;
    const newProfile = {
      id: newId,
      name: profile.name || 'Custom Voice',
      provider: profile.provider || 'Neural Web TTS',
      providerId: profile.providerId || `custom-${Date.now()}`,
      language: profile.language || 'en-US',
      style: profile.style || 'Natural Conversational',
      gender: profile.gender || 'female',
      pitch: parseFloat(profile.pitch) || 1.0,
      rate: parseFloat(profile.rate) || 1.0,
      enabled: profile.enabled !== false
    };
    profiles.push(newProfile);
    this.saveVoiceProfiles(profiles);
    return newProfile;
  }

  toggleVoiceProfile(profileId) {
    const profiles = this.getVoiceProfiles();
    const p = profiles.find(x => x.id === profileId);
    if (p) {
      p.enabled = !p.enabled;
      this.saveVoiceProfiles(profiles);
    }
    return p;
  }

  getActiveVoiceProfile() {
    const profiles = this.getVoiceProfiles();
    const activeId = localStorage.getItem('om_active_voice_profile_id');
    return profiles.find(p => p.id === activeId && p.enabled) || profiles.find(p => p.enabled) || profiles[0];
  }

  setActiveVoiceProfile(profileId) {
    const profiles = this.getVoiceProfiles();
    const target = profiles.find(p => p.id === profileId);
    if (target) {
      localStorage.setItem('om_active_voice_profile_id', target.id);
      this.currentLanguage = target.language;
      localStorage.setItem('om_voice_language', target.language);
      this.voiceGender = target.gender;
      localStorage.setItem('om_voice_gender', target.gender);
      if (window.omApp) {
        window.omApp.showToast(`Active AI Voice set to: ${target.name} (${target.style})`, 'success');
      }
    }
  }
}

window.omVoice = new OMVoiceEngine();

// Global Voice Recognition helper for instant Mic trigger
window.startVoiceRecognition = function() {
  if (window.omVoice) {
    window.omVoice.toggleRecording();
  }
};

// Global Handler for Ultra-Small Floating Voice Orb Widget
window.handleVoiceOrbClick = function(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  if (window.omVoice && (window.omVoice.isRecording || window.omVoice.isStarting)) {
    window.omVoice.stopRecording();
    return;
  }
  if (window.omVoice && window.omVoice.isPlayingTTS) {
    window.omVoice.stopSpeaking();
    return;
  }
  if (window.omJarvisLive && window.omJarvisLive.isActive) {
    if (window.omJarvisLive.isSpeaking) {
      window.omJarvisLive.stopSpeaking();
      return;
    }
  }
  window.startVoiceRecognition();
};

