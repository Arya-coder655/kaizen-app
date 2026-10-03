// Kaizen Speech Synthesis & TTS Audio Engine

class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isMuted = false;
    this.rate = 1.02;
    this.pitch = 1.0;
    this.preferredVoice = null;
    this.isSpeaking = false;
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Try to find natural high quality English voices
      const naturalVoice = voices.find(v => 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Victoria')) && 
        v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      this.preferredVoice = naturalVoice;
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  setRate(newRate) {
    this.rate = Math.max(0.7, Math.min(2.0, newRate));
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
  }

  speak(text, onStart = null, onEnd = null) {
    if (!this.isSupported() || this.isMuted || !text) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    try {
      // Clean markdown tags or bullets from text for natural speech
      const cleanText = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/\$\d+/g, (match) => `${match.slice(1)} dollars`)
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        console.warn("Speech synthesis notice:", err);
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis execution error:", e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }
}

export const speechEngine = new SpeechEngine();
