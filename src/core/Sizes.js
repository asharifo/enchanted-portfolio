import EventEmitter from '../utils/EventEmitter.js';

// Tracks viewport size + pixel ratio, and exposes a `touch` flag so the rest
// of the app can scale down particles / disable heavy post-fx on mobile.
export default class Sizes extends EventEmitter {
  constructor() {
    super();
    this.update();

    this.touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    this.mobile = window.matchMedia('(max-width: 820px)').matches;

    window.addEventListener('resize', () => {
      this.update();
      this.mobile = window.matchMedia('(max-width: 820px)').matches;
      this.trigger('resize');
    });
  }

  update() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    // cap pixel ratio at 2 — beyond that the cost isn't worth it
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
}
