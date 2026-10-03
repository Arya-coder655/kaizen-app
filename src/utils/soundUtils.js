// Kaizen Audio Engine: Synthesized Drop Sound & Harmonic Chimes using Web Audio API

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play authentic, crystalline Water Drop sound using rapid frequency sweeps
 * and exponential gain attenuation (zero external asset dependency, works offline).
 */
export function playDropSound(volume = 0.7) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Primary Droplet: rapid upward sweep creating the distinct 'plop' / water drop
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    // Frequency sweeps upward rapidly then drops slightly
    osc1.frequency.setValueAtTime(380, now);
    osc1.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
    osc1.frequency.exponentialRampToValueAtTime(950, now + 0.22);

    // Fast decay envelope
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(volume * 0.85, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.32);

    // Secondary ripple droplet for acoustic resonance (plink effect at +0.07s)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(2100, now + 0.17);

    gain2.gain.setValueAtTime(0.001, now + 0.07);
    gain2.gain.linearRampToValueAtTime(volume * 0.45, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.07);
    osc2.stop(now + 0.28);
  } catch (err) {
    console.warn("Unable to play synthesized drop sound:", err);
  }
}

/**
 * Play a gentle Kaizen Golden Bell Chime (dual-tone)
 */
export function playChimeSound(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [528, 792, 1056].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * (0.4 / (i + 1)), now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });
  } catch (err) {
    console.warn("Unable to play chime sound:", err);
  }
}
