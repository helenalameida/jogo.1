/**
 * SoundEngine.js - Motor de Efeitos Sonoros Procedurais via Web Audio API
 * Sem necessidade de arquivos de áudio externos - 100% autônomo e confiável!
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.volume = 0.8;
    this.isMuted = false;
    this.lastStepTime = 0;
    this.collectStreak = 0;
    this.lastCollectTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.volume;
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx?.currentTime || 0);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /** Passinho fofo do gatinho */
  playStep() {
    if (!this.ctx || this.isMuted) return;
    const now = performance.now();
    if (now - this.lastStepTime < 180) return;
    this.lastStepTime = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /** Coleta de petiscos com nota musical agradável que sobe em combo */
  playCollect(isFish = false) {
    if (!this.ctx || this.isMuted) return;
    const now = performance.now();
    if (now - this.lastCollectTime < 1200) {
      this.collectStreak = (this.collectStreak + 1) % 8;
    } else {
      this.collectStreak = 0;
    }
    this.lastCollectTime = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Escala pentatônica fofa: Dó, Ré, Mi, Sol, Lá...
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const baseFreq = scale[this.collectStreak] * (isFish ? 1.25 : 1.0);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.12);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, t);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, t + 0.12);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.18);
    osc2.stop(t + 0.18);
  }

  /** Miadinho procedural do gatinho ("mew~", "purr", "mroww") */
  playMeow(mood = 'happy') {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const formantFilter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    formantFilter.type = 'bandpass';
    formantFilter.Q.value = 3.5;

    if (mood === 'scared') {
      // "Mwaaao!" descendo rápido
      osc.frequency.setValueAtTime(680, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.28);
      formantFilter.frequency.setValueAtTime(1400, t);
      formantFilter.frequency.exponentialRampToValueAtTime(700, t + 0.28);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    } else {
      // "Meoow~" doce e ascendente/descendente
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(720, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(540, t + 0.32);
      formantFilter.frequency.setValueAtTime(1100, t);
      formantFilter.frequency.exponentialRampToValueAtTime(1600, t + 0.15);
      formantFilter.frequency.exponentialRampToValueAtTime(900, t + 0.32);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    }

    osc.connect(formantFilter);
    formantFilter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  /** Squeak agudo e engraçado dos ratinhos */
  playSqueak() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(2200, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.12);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  /** Fanfarra de Power-Up cintilante */
  playPowerUp() {
    if (!this.ctx || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  /** Sininho cristalino de sonar */
  playBell() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2093, t); // C7
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3135, t); // G7

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.8);
    osc2.stop(t + 0.8);
  }

  /** Som de confusão / tontura dos ratinhos */
  playDizzy() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, t);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(14, t);
    lfoGain.gain.setValueAtTime(120, t);

    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 0.5);
    osc.stop(t + 0.5);
  }

  /** Dano / impacto fofo quando o ratinho alcança o gato */
  playHit() {
    if (!this.ctx || this.isMuted) return;
    this.playMeow('scared');

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /** Fanfarra de vitória de fase */
  playVictory() {
    if (!this.ctx || this.isMuted) return;
    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 1046.50, d: 0.45 },
    ];
    let offset = 0;
    const now = this.ctx.currentTime;

    melody.forEach(item => {
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + item.d);
      offset += item.d * 0.9;
    });
  }

  /** Som fofo de porta abrindo */
  playDoorOpen() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(330, t + 0.3);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  /** Som mágico ao equipar roupa ou acessório */
  playEquip() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = [659.25, 880.00, 1174.66]; // Mi, Lá, Ré agudo

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.12, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(st);
      osc.stop(st + 0.15);
    });
  }

  /** Som macio ao encostar em almofadas / brinquedos */
  playBoing() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Melodia fofa e calma de Game Over */
  playGameOver() {
    if (!this.ctx || this.isMuted) return;
    const melody = [587.33, 523.25, 440.00, 349.23];
    let offset = 0;
    const now = this.ctx.currentTime;

    melody.forEach(freq => {
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.35);
      offset += 0.28;
    });
  }
}
