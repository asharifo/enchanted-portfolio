import EventEmitter from '../utils/EventEmitter.js';

// Central rAF clock. Emits `tick` every frame with elapsed/delta seconds.
// delta is clamped so a tab-switch stall doesn't fling animations across the room.
export default class Time extends EventEmitter {
  constructor() {
    super();
    this.start = performance.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 0.016;
    this.running = true;

    // kick off on the next frame so listeners can subscribe first
    window.requestAnimationFrame(() => this.tick());
  }

  tick() {
    const current = performance.now();
    this.delta = Math.min((current - this.current) / 1000, 0.05);
    this.current = current;
    this.elapsed = (this.current - this.start) / 1000;

    if (this.running) this.trigger('tick');
    window.requestAnimationFrame(() => this.tick());
  }

  // expose elapsed in seconds (handy for shaders / sway maths)
  get seconds() {
    return this.elapsed;
  }
}
