import * as THREE from 'three';
import Experience from './Experience.js';
import EventEmitter from '../utils/EventEmitter.js';

// Raycasts ONLY against registered invisible hitboxes — never the visual meshes,
// which scale/sway/float. That decoupling is what keeps hover & click rock-steady.
// Emits: 'hover' [hitbox], 'hoverEnd' [hitbox], 'select' [hitbox].
export default class Interactions extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.canvas = this.experience.canvas;
    this.camera = this.experience.camera;

    this.targets = [];
    this.hovered = null;
    this.enabled = false; // turned on after the intro completes

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-2, -2); // offscreen until first move
    this.pointerActive = false;

    this._downPos = new THREE.Vector2();
    this._downTime = 0;
    this._dragging = false;

    this.bindEvents();
  }

  register(hitbox) {
    this.targets.push(hitbox);
  }

  setEnabled(state) {
    this.enabled = state;
    if (!state && this.hovered) {
      this.trigger('hoverEnd', [this.hovered]);
      this.hovered = null;
      this.setCursor(false);
    }
  }

  bindEvents() {
    const el = this.canvas;
    el.addEventListener('pointermove', (e) => this.onPointerMove(e));
    el.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    el.addEventListener('pointerup', (e) => this.onPointerUp(e));
    el.addEventListener('pointerleave', () => {
      this.pointerActive = false;
      this.pointer.set(-2, -2);
    });
  }

  updatePointer(e) {
    this.pointer.x = (e.clientX / this.sizes.width) * 2 - 1;
    this.pointer.y = -(e.clientY / this.sizes.height) * 2 + 1;
    this.pointerActive = true;
  }

  onPointerMove(e) {
    this.updatePointer(e);
    if (this._pointerDown) {
      const dist = Math.hypot(e.clientX - this._downPos.x, e.clientY - this._downPos.y);
      if (dist > 9) this._dragging = true; // it's an orbit drag, not a tap
    }
  }

  onPointerDown(e) {
    this._pointerDown = true;
    this._dragging = false;
    this._downPos.set(e.clientX, e.clientY);
    this._downTime = performance.now();
    this.updatePointer(e);
  }

  onPointerUp(e) {
    const wasTap =
      this._pointerDown && !this._dragging && performance.now() - this._downTime < 600;
    this._pointerDown = false;

    if (!wasTap || !this.enabled) return;
    // re-evaluate exactly under the release point (handles touch with no hover)
    this.updatePointer(e);
    const hit = this.castNow();
    if (hit) this.trigger('select', [hit]);
  }

  castNow() {
    if (!this.targets.length) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera.instance);
    const hits = this.raycaster.intersectObjects(this.targets, false);
    return hits.length ? hits[0].object : null;
  }

  setCursor(active) {
    this.canvas.style.cursor = active ? 'pointer' : 'grab';
  }

  // Run each frame so hover stays correct even while the camera moves.
  update() {
    if (!this.enabled || !this.pointerActive) return;
    const hit = this.castNow();

    if (hit !== this.hovered) {
      if (this.hovered) this.trigger('hoverEnd', [this.hovered]);
      this.hovered = hit;
      if (hit) {
        this.trigger('hover', [hit]);
        this.setCursor(true);
      } else {
        this.setCursor(false);
      }
    }
  }
}
