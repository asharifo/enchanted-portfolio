import gsap from 'gsap';
import Experience from '../core/Experience.js';
import { PANELS } from './Panels.js';

// All DOM / overlay mechanics: loader + intro gate, cursor tooltip, themed
// panels with smooth GSAP transitions, lantern toasts, and the sound toggle.
export default class UIManager {
  constructor() {
    this.experience = new Experience();
    this.resources = this.experience.resources;

    this.isOpen = false;
    this.onCloseCb = null;
    this.pointer = { x: 0, y: 0 };
    this.worldReady = false;

    this.buildDOM();
    this.cacheRefs();
    this.bind();

    this.resources.on('progress', (p) => this.setProgress(p));
  }

  buildDOM() {
    this.root = document.createElement('div');
    this.root.id = 'ui-root';
    this.root.innerHTML = `
      <div class="loader" data-loader>
        <div class="loader__glyph">
          <svg viewBox="0 0 120 120" class="loader__ring">
            <circle class="loader__track" cx="60" cy="60" r="52"></circle>
            <circle class="loader__fill" cx="60" cy="60" r="52" data-ring></circle>
          </svg>
          <span class="loader__pct" data-pct>0%</span>
        </div>
        <h1 class="loader__title">The&nbsp;Enchanted&nbsp;Nook</h1>
        <p class="loader__sub">An interactive portfolio you can wander.</p>
        <button class="enter-btn" data-enter disabled>Awakening the nook…</button>
      </div>

      <header class="topbar" data-topbar>
        <span class="brand">✦ The Enchanted Nook</span>
        <div class="topbar__actions">
          <button class="pill-btn" data-about>✦&nbsp;About</button>
          <button class="icon-btn sound-toggle" data-sound aria-label="Toggle sound" title="Toggle sound">♪</button>
        </div>
      </header>

      <div class="hint" data-hint>
        <span class="hint__drag">⟲ Drag to look around</span>
        <span class="hint__dot">·</span>
        <span>Click the glowing objects ✦</span>
      </div>

      <div class="tooltip" data-tooltip></div>
      <div class="toast" data-toast></div>

      <div class="panel-backdrop" data-backdrop></div>
      <section class="panel" data-panel role="dialog" aria-modal="true" aria-hidden="true">
        <button class="panel__close" data-close aria-label="Close">✕</button>
        <div class="panel__edge panel__edge--top"></div>
        <div class="panel__content" data-content></div>
        <div class="panel__edge panel__edge--bottom"></div>
      </section>
    `;
    document.body.appendChild(this.root);
  }

  cacheRefs() {
    const q = (s) => this.root.querySelector(s);
    this.el = {
      loader: q('[data-loader]'),
      ring: q('[data-ring]'),
      pct: q('[data-pct]'),
      enter: q('[data-enter]'),
      topbar: q('[data-topbar]'),
      hint: q('[data-hint]'),
      tooltip: q('[data-tooltip]'),
      toast: q('[data-toast]'),
      backdrop: q('[data-backdrop]'),
      panel: q('[data-panel]'),
      close: q('[data-close]'),
      content: q('[data-content]'),
      sound: q('[data-sound]'),
      about: q('[data-about]'),
    };
    // prep the progress ring dash
    const r = 52;
    this.circ = 2 * Math.PI * r;
    this.el.ring.style.strokeDasharray = `${this.circ}`;
    this.el.ring.style.strokeDashoffset = `${this.circ}`;
  }

  bind() {
    this.el.enter.addEventListener('click', () => this.enter());
    this.el.close.addEventListener('click', () => this.close());
    this.el.backdrop.addEventListener('click', () => this.close());
    this.el.sound.addEventListener('click', () => this.toggleSound());
    this.el.about.addEventListener('click', () => this.experience.world?.openAbout());

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
    window.addEventListener('pointermove', (e) => {
      this.pointer.x = e.clientX;
      this.pointer.y = e.clientY;
      if (this.tooltipVisible) this.positionTooltip();
    });
  }

  // ── loader ────────────────────────────────────────────────────────────────
  setProgress(p) {
    const pct = Math.round(p * 100);
    this.el.pct.textContent = `${pct}%`;
    this.el.ring.style.strokeDashoffset = `${this.circ * (1 - p)}`;
  }

  onWorldReady() {
    this.worldReady = true;
    this.el.enter.disabled = false;
    this.el.enter.textContent = 'Enter the Nook';
    this.el.enter.classList.add('is-ready');
  }

  enter() {
    if (!this.worldReady) return;
    this.experience.start();
    gsap.to(this.el.loader, {
      opacity: 0,
      scale: 1.06,
      duration: 1.1,
      ease: 'power2.inOut',
      onComplete: () => {
        this.el.loader.style.display = 'none';
      },
    });
    gsap.to(this.el.topbar, { opacity: 1, y: 0, duration: 1, delay: 0.6 });
  }

  onIntroComplete() {
    gsap.fromTo(
      this.el.hint,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );
    // gently retire the hint after a while
    gsap.to(this.el.hint, { opacity: 0, duration: 1.2, delay: 7 });
  }

  // ── tooltip ────────────────────────────────────────────────────────────────
  showTooltip(text) {
    if (this.isOpen) return;
    this.el.tooltip.textContent = text;
    this.el.tooltip.classList.add('is-visible');
    this.tooltipVisible = true;
    this.positionTooltip();
  }

  hideTooltip() {
    this.el.tooltip.classList.remove('is-visible');
    this.tooltipVisible = false;
  }

  positionTooltip() {
    this.el.tooltip.style.transform = `translate(${this.pointer.x}px, ${this.pointer.y}px)`;
  }

  // ── toast (lantern whispers) ────────────────────────────────────────────────
  toast(text) {
    clearTimeout(this._toastTimer);
    this.el.toast.textContent = text;
    this.el.toast.classList.add('is-visible');
    this._toastTimer = setTimeout(() => this.el.toast.classList.remove('is-visible'), 3200);
  }

  // ── panels ──────────────────────────────────────────────────────────────────
  open(action, { title, onClose } = {}) {
    const panel = PANELS[action];
    if (!panel) return;
    this.hideTooltip();
    this.isOpen = true;
    this.onCloseCb = onClose;

    this.el.content.innerHTML = panel.render();
    this.el.panel.dataset.theme = panel.theme;
    this.el.panel.setAttribute('aria-hidden', 'false');
    this.el.panel.classList.add('is-open');
    this.el.backdrop.classList.add('is-open');

    gsap.killTweensOf([this.el.panel, this.el.backdrop]);
    gsap.fromTo(this.el.backdrop, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.fromTo(
      this.el.panel,
      { opacity: 0, y: 40, scale: 0.94, rotateX: 8 },
      { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.75, ease: 'power3.out' }
    );
    // stagger the inner items in
    const items = this.el.content.querySelectorAll('.entry, .agecard, .rune, .about');
    gsap.fromTo(
      items,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, delay: 0.18, ease: 'power2.out' }
    );
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    const cb = this.onCloseCb;
    this.onCloseCb = null;

    gsap.killTweensOf([this.el.panel, this.el.backdrop]);
    gsap.to(this.el.backdrop, { opacity: 0, duration: 0.5, onComplete: () => this.el.backdrop.classList.remove('is-open') });
    gsap.to(this.el.panel, {
      opacity: 0,
      y: 30,
      scale: 0.95,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        this.el.panel.classList.remove('is-open');
        this.el.panel.setAttribute('aria-hidden', 'true');
        this.el.content.innerHTML = '';
        cb?.();
      },
    });
  }

  // ── sound ────────────────────────────────────────────────────────────────────
  toggleSound() {
    const muted = this.experience.audio.toggleMute();
    this.el.sound.classList.toggle('is-muted', muted);
    this.el.sound.textContent = muted ? '𝄽' : '♪';
  }
}
