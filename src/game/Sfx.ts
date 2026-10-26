/**
 * Procedural sound effects through the Web Audio API, so the prototype ships with no audio assets.
 * Swap for recorded sounds (Freesound / Kenney) later; the call sites stay the same.
 */
export interface SfxOpts {
  /** -1 (left) .. 1 (right). */
  pan?: number;
  /** 0..1 multiplier, e.g. for distance. */
  vol?: number;
}

export class Sfx {
  private ctx?: AudioContext;
  private master?: GainNode;
  private noiseBuf?: AudioBuffer;
  muted = false;

  /** Must be called from a user gesture before anything is audible. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.45;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    void this.ctx.resume();
  }

  shot(heavy = false, o: SfxOpts = {}, suppressed = false): void {
    if (suppressed) {
      // A muffled cough rather than a crack.
      this.noise(0.08, 900, 'lowpass', 0.5, o);
      this.tone(110, 50, 0.08, 'sine', 0.4, o);
      return;
    }
    this.noise(heavy ? 0.22 : 0.15, heavy ? 1600 : 2600, 'lowpass', 0.9, o);
    this.tone(heavy ? 120 : 160, 45, 0.14, 'sine', 0.7, o);
  }

  dryFire(o: SfxOpts = {}): void {
    this.noise(0.03, 5000, 'highpass', 0.25, o);
  }

  reload(o: SfxOpts = {}): void {
    this.noise(0.04, 3500, 'bandpass', 0.35, o);
    this.noise(0.05, 2200, 'bandpass', 0.4, o, 0.35);
  }

  creak(o: SfxOpts = {}): void {
    const vol = 0.06 * (o.vol ?? 1);
    this.sweep(170, 260, 0.55, vol, o.pan);
  }

  footstep(loud: boolean, o: SfxOpts = {}): void {
    this.noise(0.05, loud ? 900 : 600, 'lowpass', loud ? 0.35 : 0.12, o);
  }

  railTick(o: SfxOpts = {}): void {
    this.noise(0.06, 1400, 'bandpass', 0.18, o);
  }

  hit(o: SfxOpts = {}): void {
    this.noise(0.07, 1800, 'bandpass', 0.6, o);
  }

  impact(o: SfxOpts = {}): void {
    this.noise(0.05, 3000, 'highpass', 0.15, o);
  }

  /** A UI selection tick. */
  select(): void {
    this.noise(0.02, 4000, 'highpass', 0.3);
  }

  /** The operator takes a hit. */
  hurt(): void {
    this.tone(120, 60, 0.25, 'sine', 0.9);
    this.noise(0.12, 700, 'lowpass', 0.6);
  }

  /** An enemy shouting a warning: a short, rough burst. */
  shout(o: SfxOpts = {}): void {
    this.tone(260, 180, 0.3, 'sawtooth', 0.08, o);
    this.tone(330, 220, 0.25, 'square', 0.04, o, 0.05);
  }

  penalty(): void {
    this.tone(220, 200, 0.35, 'square', 0.12);
    this.tone(160, 150, 0.45, 'square', 0.12, {}, 0.12);
  }

  ok(): void {
    this.tone(660, 660, 0.12, 'triangle', 0.25);
    this.tone(990, 990, 0.2, 'triangle', 0.25, {}, 0.1);
  }

  secured(): void {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, 0.35, 'triangle', 0.22, {}, i * 0.12));
  }

  private out(pan: number | undefined): AudioNode | undefined {
    if (!this.ctx || !this.master || this.muted) return undefined;
    if (pan === undefined || !this.ctx.createStereoPanner) return this.master;
    const p = this.ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    p.connect(this.master);
    return p;
  }

  private noise(dur: number, freq: number, type: BiquadFilterType, gain: number, o: SfxOpts = {}, delay = 0): void {
    const dest = this.out(o.pan);
    if (!this.ctx || !dest || !this.noiseBuf) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain * (o.vol ?? 1), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  private tone(f0: number, f1: number, dur: number, type: OscillatorType, gain: number, o: SfxOpts = {}, delay = 0): void {
    const dest = this.out(o.pan);
    if (!this.ctx || !dest) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain * (o.vol ?? 1), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private sweep(f0: number, f1: number, dur: number, gain: number, pan?: number): void {
    const dest = this.out(pan);
    if (!this.ctx || !dest) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.linearRampToValueAtTime(f1, t + dur * 0.6);
    osc.frequency.linearRampToValueAtTime(f0 * 0.9, t + dur);
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900;
    f.Q.value = 6;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.05);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    osc.connect(f).connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
}
