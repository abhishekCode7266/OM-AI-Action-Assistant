/**
 * OM AI Assistant - Voice Engine (Universal Multilingual & Dual Male/Female Voices)
 * Supports 20+ Global World Languages, Speech-to-Text Recognition,
 * Male/Female Voice Synthesis with Pitch/Cadence modulation, and Hands-free Dictation.
 */

class OMVoiceEngine {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
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

      this.recognition.onstart = () => {
        this.isRecording = true;
        this.updateVisualState(true);
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

        const input = document.getElementById('chat-user-input');
        if (input) {
          if (finalTranscript) {
            input.value = (input.value ? input.value + ' ' : '') + finalTranscript;
          }
        }

        const pulseText = document.getElementById('voice-transcript-preview');
        if (pulseText) {
          pulseText.textContent = interim || finalTranscript || `Listening in ${this.getLanguageDisplayName()}...`;
        }
      };

      this.recognition.onerror = (e) => {
        console.warn("Speech recognition error", e.error);
        this.stopRecording();
      };

      this.recognition.onend = () => {
        this.stopRecording();
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
    if (!this.recognition) {
      if (window.omApp) {
        window.omApp.showToast("Voice dictation is not supported in this browser. Try Chrome or Edge.", "info");
      }
      return;
    }

    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    if (this.recognition && !this.isRecording) {
      try {
        this.recognition.lang = this.currentLanguage;
        this.recognition.start();
      } catch (e) {
        console.warn("Recognition already started or permission error", e);
      }
    }
  }

  stopRecording() {
    this.isRecording = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.updateVisualState(false);
  }

  updateVisualState(recording) {
    const voiceBtn = document.getElementById('btn-voice-input');
    const visualizer = document.getElementById('voice-visualizer-bar');
    if (voiceBtn) {
      voiceBtn.classList.toggle('recording', recording);
      voiceBtn.innerHTML = recording ? '🔴' : '🎙️';
    }
    if (visualizer) {
      visualizer.style.display = recording ? 'flex' : 'none';
    }
  }

  findBestVoice(langCode, gender) {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    const langPrefix = langCode.split('-')[0].toLowerCase();

    // Matching language voices
    const matchingLangVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));

    if (gender === 'female') {
      // Search for female indicators in voice name
      const femaleKeywords = ['female', 'woman', 'zira', 'samantha', 'kavya', 'priya', 'victoria', 'eva', 'yuna', 'amelie', 'anna', 'monica', 'google', 'hindi'];
      const femaleVoice = matchingLangVoices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (femaleVoice) return femaleVoice;
      if (matchingLangVoices.length > 1) return matchingLangVoices[1]; // Often second voice in OS is female
    } else {
      // Search for male indicators
      const maleKeywords = ['male', 'man', 'david', 'george', 'daniel', 'oliver', 'rishi', 'alex', 'guy', 'stefan', 'thomas'];
      const maleVoice = matchingLangVoices.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (maleVoice) return maleVoice;
      if (matchingLangVoices.length > 0) return matchingLangVoices[0];
    }

    if (matchingLangVoices.length > 0) return matchingLangVoices[0];
    return voices[0] || null;
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
      this.currentUtterance.pitch = 1.15; // Bright, clear, energetic F.R.I.D.A.Y. timbre
      this.currentUtterance.rate = 1.05;
    } else {
      this.currentUtterance.pitch = 0.94; // Deep, confident J.A.R.V.I.S. timbre
      this.currentUtterance.rate = 1.04;
    }

    this.currentUtterance.onstart = () => {
      this.isPlayingTTS = true;
      this.activeTTSMsgId = msgId;
      this.updateTTSButtonState(msgId, true);
    };

    this.currentUtterance.onend = () => {
      this.isPlayingTTS = false;
      this.updateTTSButtonState(msgId, false);
      this.activeTTSMsgId = null;
    };

    this.currentUtterance.onerror = () => {
      this.isPlayingTTS = false;
      this.updateTTSButtonState(msgId, false);
      this.activeTTSMsgId = null;
    };

    this.synth.speak(this.currentUtterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlayingTTS = false;
      if (this.activeTTSMsgId) {
        this.updateTTSButtonState(this.activeTTSMsgId, false);
        this.activeTTSMsgId = null;
      }
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
}

window.omVoice = new OMVoiceEngine();
