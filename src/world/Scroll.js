import * as THREE from 'three';
import gsap from 'gsap';
import Experience from '../core/Experience.js';
import { normalizeToBase } from '../core/Resources.js';
import { makeGlow } from '../utils/textures.js';
import { props, palette } from '../data/config.js';

// The Work-Experience scroll. Rests on the desk; lifts + glows on hover; lifts
// further and turns before the ripped-parchment panel unfurls.
export default class Scroll {
  constructor(environment) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.environment = environment;
    this.cfg = props.scroll;

    this.group = new THREE.Group();
    this.group.name = 'ScrollGroup';
    this.scene.add(this.group);
    this.build();
  }

  build() {
    const model = this.resources.items.scroll.scene.clone(true);
    const holder = new THREE.Group();
    model.scale.setScalar(this.cfg.scale);
    holder.add(model);
    normalizeToBase(holder);

    holder.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => this.environment?.tuneMaterial(m));
    });

    this.inner = holder; // animated on hover/select
    this.group.add(holder);

    this.group.position.set(...this.cfg.position);
    this.group.rotation.y = this.cfg.rotationY;
    this.group.rotation.z = this.cfg.rotationZ || 0;
    this.baseY = this.group.position.y;

    // parchment-warm aura, hidden until hover
    this.glow = makeGlow(palette.spark, 1.3, 0);
    this.glow.position.set(0, 0.25, 0);
    this.group.add(this.glow);
  }

  onHover(state) {
    this.hovering = state;
    gsap.to(this.inner.scale, {
      x: state ? 1.08 : 1,
      y: state ? 1.08 : 1,
      z: state ? 1.08 : 1,
      duration: 0.45,
      ease: 'power2.out',
    });
    gsap.to(this.group.position, { y: this.baseY + (state ? 0.12 : 0), duration: 0.45, ease: 'power2.out' });
    gsap.to(this.glow.material, { opacity: state ? 0.8 : 0, duration: 0.4 });
    gsap.to(this.inner.rotation, { y: state ? 0.15 : 0, duration: 0.6, ease: 'power2.out' });
  }

  // pre-open flourish: lift + spin, resolves when the UI should appear
  onSelect() {
    this.hovering = true; // keep the aura lit while focused
    const tl = gsap.timeline();
    tl.to(this.group.position, { y: this.baseY + 0.45, duration: 0.6, ease: 'power2.out' });
    tl.to(this.inner.rotation, { y: this.inner.rotation.y + Math.PI * 0.5, duration: 0.7, ease: 'power2.inOut' }, '<');
    tl.to(this.glow.material, { opacity: 1, duration: 0.4 }, '<');
    return tl;
  }

  reset() {
    this.hovering = false;
    gsap.to(this.group.position, { y: this.baseY, duration: 0.6, ease: 'power2.inOut' });
  }

  update(delta, elapsed) {
    this.glow.material.rotation += delta * 0.3;
    // faint always-on shimmer at rest so the scroll reads as interactive
    if (!this.hovering) this.glow.material.opacity = 0.12 + Math.sin(elapsed * 2.2) * 0.07;
  }
}
