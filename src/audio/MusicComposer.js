/**
 * MusicComposer.js - Compositor de Trilha Musical Procedural BGM
 * Melodia alegre, aconchegante e saltitante estilo desenho animado fofo
 */

export class MusicComposer {
  constructor(soundEngine) {
    this.soundEngine = soundEngine;
    this.isPlaying = false;
    this.volume = 0.55;
    this.musicGain = null;
    this.tempo = 118; // BPM
    this.step = 0;
    this.timerId = null;
    this.isMuted = false;

    // Progressão harmônica fofa (Dó Maior pentatônica e tétrades suaves):
    // Cmaj7 -> Am7 -> Dm7 -> G7sus4 -> Cmaj7
    this.bassNotes = [
      130.81, 130.81, 130.81, 146.83, // C3
      110.00, 110.00, 110.00, 123.47, // A2
      146.83, 146.83, 146.83, 164.81, // D3
      98.00,  98.00,  123.47, 146.83  // G2
    ];

    this.leadMelody = [
      523.25, 659.25, 783.99, 659.25,  // C5, E5, G5, E5
      880.00, 783.99, 659.25, 587.33,  // A5, G5, E5, D5
      587.33, 659.25, 698.46, 783.99,  // D5, E5, F5, G5
      880.00, 783.99, 1046.50, 0       // A5, G5, C6, pausa
    ];
  }

  init() {
    if (!this.soundEngine.ctx) {
      this.soundEngine.init();
    }
    const ctx = this.soundEngine.ctx;
    if (ctx && !this.musicGain) {
      this.musicGain = ctx.createGain();
      this.musicGain.gain.value = this.volume;
      this.musicGain.connect(this.soundEngine.masterGain);
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.soundEngine.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.soundEngine.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.musicGain && this.soundEngine.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.soundEngine.ctx.currentTime);
    }
    return this.isMuted;
  }

  start() {
    if (this.isPlaying) return;
    this.init();
    this.isPlaying = true;
    this.step = 0;
    this.scheduleNextTick();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  scheduleNextTick() {
    if (!this.isPlaying) return;
    const interval = (60 / this.tempo / 2) * 1000; // semicolcheias

    this.playBeat(this.step);
    this.step = (this.step + 1) % 32;

    this.timerId = setTimeout(() => {
      this.scheduleNextTick();
    }, interval);
  }

  playBeat(stepIdx) {
    const ctx = this.soundEngine.ctx;
    if (!ctx || this.isMuted || this.volume <= 0.01) return;
    const t = ctx.currentTime;

    // 1. Linha de Baixo Macia
    if (stepIdx % 2 === 0) {
      const bassIdx = Math.floor(stepIdx / 2) % this.bassNotes.length;
      const freq = this.bassNotes[bassIdx];

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.22);
    }

    // 2. Melodia Saltitante Estilo Xilofone/Marimba
    const melIdx = Math.floor(stepIdx / 2) % this.leadMelody.length;
    const melFreq = this.leadMelody[melIdx];

    if (melFreq > 0 && stepIdx % 2 === 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(melFreq, t);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.2);
    }

    // 3. Toque de chimbal suave e fofo nos contratempos
    if (stepIdx % 2 === 1) {
      const noiseGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(4000 + Math.random() * 800, t);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6000, t);

      noiseGain.gain.setValueAtTime(0.018, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

      osc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.04);
    }
  }
}
