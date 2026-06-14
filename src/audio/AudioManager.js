// Fully procedural Web-Audio score. No audio files: a generative ambient pad +
// sparse pentatonic bells for "fantasy music", plus synthesized SFX for every
// interaction. Everything is gated behind start() (a real user gesture).
export default class AudioManager {
  constructor() {
    this.ready = false;
    this.muted = false;
    this.ctx = null;
    this._lastHover = 0;
    // A minor pentatonic across two octaves — gentle, "magical" intervals.
    this.scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
  }

  start() {
    if (this.ready) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
    } catch (e) {
      console.warn('[Audio] Web Audio unavailable', e);
      return;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    this.master.connect(this.ctx.destination);

    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.makeImpulse(3.2, 2.6);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.55;
    this.reverb.connect(this.reverbGain).connect(this.master);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.master);
    this.musicGain.connect(this.reverb);

    this.ready = true;
    this.startAmbient();
    // fade the music in
    this.musicGain.gain.setTargetAtTime(0.5, this.ctx.currentTime, 2.5);
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  makeImpulse(duration, decay) {
    const rate = this.ctx.sampleRate;
    const len = rate * duration;
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  noiseBuffer(seconds = 1) {
    const len = this.ctx.sampleRate * seconds;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ── ambient bed ────────────────────────────────────────────────────────
  startAmbient() {
    const now = this.ctx.currentTime;
    this.drone = [];
    const root = 110; // A2
    const intervals = [1, 1.5, 2]; // root, fifth, octave
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    filter.Q.value = 0.7;
    filter.connect(this.musicGain);

    // slow LFO opening/closing the filter
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    intervals.forEach((mult, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i === 2 ? 'triangle' : 'sine';
      osc.frequency.value = root * mult;
      osc.detune.value = (Math.random() - 0.5) * 8;
      const g = this.ctx.createGain();
      g.gain.value = 0.16 / (i + 1);
      osc.connect(g).connect(filter);
      osc.start(now);
      this.drone.push({ osc, g });
    });

    this.scheduleBell();
  }

  // sparse generative bell melody
  scheduleBell() {
    if (!this.ready) return;
    const delay = 2200 + Math.random() * 4200;
    this._bellTimer = setTimeout(() => {
      if (this.master.gain.value > 0.001) {
        const f = this.scale[Math.floor(Math.random() * this.scale.length)];
        this.bell(f, 0.12, this.ctx.currentTime, 2.6);
      }
      this.scheduleBell();
    }, delay);
  }

  // FM-ish additive bell
  bell(freq, vol, when = this.ctx.currentTime, decay = 2.2, dest = this.reverb) {
    if (!this.ready) return;
    const partials = [1, 2.01, 3.0, 4.2];
    const gains = [1, 0.5, 0.32, 0.18];
    partials.forEach((p, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * p;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(vol * gains[i], when + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, when + decay * (1 - i * 0.12));
      osc.connect(g).connect(dest);
      osc.connect(g).connect(this.master);
      osc.start(when);
      osc.stop(when + decay);
    });
  }

  // ── public SFX ───────────────────────────────────────────────────────────
  chime(vol = 0.5) {
    if (!this.ready) return;
    const now = this.ctx.currentTime;
    // a quick rising arpeggio of bells = "firefly chime"
    [0, 0.07, 0.14, 0.22].forEach((t, i) => {
      this.bell(this.scale[3 + i] || this.scale[i], vol * 0.5, now + t, 2.4);
    });
  }

  hoverTick() {
    if (!this.ready) return;
    const now = performance.now();
    if (now - this._lastHover < 110) return;
    this._lastHover = now;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // filtered-noise gesture used for paper / cloth
  rustle({ dur = 0.6, f0 = 1200, f1 = 600, q = 1.2, vol = 0.18 } = {}) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer(dur);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(this.master);
    g.connect(this.reverb);
    src.start(t);
    src.stop(t + dur);
  }

  select(action) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    switch (action) {
      case 'work': // scroll unfurling
        this.rustle({ dur: 0.9, f0: 1600, f1: 500, q: 0.9, vol: 0.2 });
        this.rustle({ dur: 0.5, f0: 900, f1: 1400, q: 1.5, vol: 0.1 });
        this.bell(330, 0.1, t + 0.2, 2);
        break;
      case 'projects': // book thud + page flutter
        this.thud(70, 0.16);
        this.rustle({ dur: 0.4, f0: 2200, f1: 1200, q: 2, vol: 0.12 });
        this.bell(392, 0.12, t + 0.15, 2.2);
        break;
      case 'skills': // buckle click + rising arpeggio
        this.thud(180, 0.08);
        [0, 0.08, 0.16].forEach((d, i) => this.bell(this.scale[2 + i], 0.09, t + d, 1.8));
        break;
      case 'about': // glassy shimmer
        this.bell(523.25, 0.12, t, 3);
        this.bell(659.25, 0.1, t + 0.1, 3);
        this.rustle({ dur: 0.5, f0: 3000, f1: 5000, q: 3, vol: 0.05 });
        break;
      default:
        this.bell(440, 0.1, t, 2);
    }
  }

  thud(freq = 80, vol = 0.16) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.6, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  close() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.bell(294, 0.09, t, 1.6);
    this.bell(220, 0.08, t + 0.08, 1.8);
  }

  setMuted(state) {
    this.muted = state;
    if (this.ready) this.master.gain.setTargetAtTime(state ? 0 : 0.9, this.ctx.currentTime, 0.2);
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }
}
