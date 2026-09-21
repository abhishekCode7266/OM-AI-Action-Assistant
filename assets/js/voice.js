/**
 * OM AI Assistant - Voice Engine
 * Handles Speech-to-Text (Dictation) and Text-to-Speech (Audio response read-out).
 */

class OMVoiceEngine {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.isPlayingTTS = false;
    this.activeTTSMsgId = null;

    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

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
          pulseText.textContent = interim || finalTranscript || "Listening to your voice...";
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
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#+\s+/g, "")
      .replace(/[*_~]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .substring(0, 1500); // safety length

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    const settings = window.omChatStore ? window.omChatStore.settings : {};
    this.currentUtterance.rate = settings.voiceRate || 1.0;
    this.currentUtterance.pitch = settings.voicePitch || 1.0;

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
