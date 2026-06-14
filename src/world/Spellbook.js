import * as THREE from 'three';
import gsap from 'gsap';
import Experience from '../core/Experience.js';
import { makeGlow } from '../utils/textures.js';
import { props, palette } from '../data/config.js';

// Build one stylised low-poly book (cover + pages + spine) as a group whose
// pivot is the spine, so the top cover can swing open like a real book.
function makeBook({ w = 0.62, h = 0.12, d = 0.46, cover = '#3a2a4d', accent = '#caa24a' }) {
  const group = new THREE.Group();
  const coverMat = new THREE.MeshStandardMaterial({ color: cover, roughness: 0.7, metalness: 0.1 });
  const pageMat = new THREE.MeshStandardMaterial({ color: '#e9dcc2', roughness: 0.95 });
  const trimMat = new THREE.MeshStandardMaterial({
    color: accent,
    roughness: 0.5,
    metalness: 0.6,
    emissive: new THREE.Color(accent),
    emissiveIntensity: 0.25,
  });

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.28, d), coverMat);
  bottom.position.y = h * 0.14;
  const pages = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, h * 0.5, d * 0.94), pageMat);
  pages.position.y = h * 0.55;

  // top cover pivots on the spine (-w/2)
  const coverPivot = new THREE.Group();
  coverPivot.position.set(-w / 2, h * 0.82, 0);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.22, d), coverMat);
  top.position.set(w / 2, 0, 0);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(w * 0.12, h * 0.24, d * 0.9), trimMat);
  trim.position.set(w * 0.92, 0.001, 0);
  coverPivot.add(top, trim);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(h * 0.3, h, d), coverMat);
  spine.position.set(-w / 2, h * 0.5, 0);

  [bottom, pages, top, trim, spine].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
  });

  group.add(bottom, pages, spine, coverPivot);
  group.userData.coverPivot = coverPivot;
  return group;
}

// Projects prop — a small stack of tomes topped by a glowing one, ringed by
// floating runes. Lifts + flutters before the aged-paper cards appear.
export default class Spellbook {
  constructor(environment) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.environment = environment;
    this.cfg = props.spellbook;

    this.group = new THREE.Group();
    this.group.name = 'SpellbookGroup';
    this.scene.add(this.group);
    this.runes = [];
    this.build();
  }

  build() {
    // two books leaning in the stack
    const b1 = makeBook({ w: 0.72, h: 0.13, d: 0.52, cover: '#2f2440', accent: '#8a6bd1' });
    b1.rotation.y = 0.12;

    const b2 = makeBook({ w: 0.64, h: 0.12, d: 0.46, cover: '#3c2a2a', accent: '#caa24a' });
    b2.position.set(0.04, 0.13, 0.02);
    b2.rotation.y = -0.18;

    // the hero open book on top
    this.topBook = makeBook({ w: 0.6, h: 0.12, d: 0.44, cover: '#26344d', accent: '#5fb8ff' });
    this.topBook.position.set(0, 0.25, 0);
    this.topBook.rotation.y = 0.05;
    this.topCover = this.topBook.userData.coverPivot;

    this.stack = new THREE.Group();
    this.stack.add(b1, b2, this.topBook);
    this.group.add(this.stack);

    this.stack.traverse((c) => {
      if (c.isMesh) this.environment?.tuneMaterial(c.material);
    });

    // glow rising from the open pages
    this.glow = makeGlow(palette.moon, 1.1, 0.55);
    this.glow.position.set(0, 0.5, 0);
    this.group.add(this.glow);

    // floating rune motes
    for (let i = 0; i < 5; i++) {
      const r = makeGlow(i % 2 ? palette.rim : palette.moon, 0.22, 0.8);
      r.userData.seed = Math.random() * 10;
      r.userData.radius = 0.3 + Math.random() * 0.25;
      this.runes.push(r);
      this.group.add(r);
    }

    this.group.position.set(...this.cfg.position);
    this.group.rotation.y = this.cfg.rotationY;
    this.baseY = this.group.position.y;
  }

  onHover(state) {
    gsap.to(this.stack.scale, {
      x: state ? 1.07 : 1,
      y: state ? 1.07 : 1,
      z: state ? 1.07 : 1,
      duration: 0.45,
      ease: 'power2.out',
    });
    gsap.to(this.group.position, { y: this.baseY + (state ? 0.1 : 0), duration: 0.45, ease: 'power2.out' });
    gsap.to(this.glow.material, { opacity: state ? 0.95 : 0.55, duration: 0.4 });
    gsap.to(this.topCover.rotation, { z: state ? -0.35 : 0, duration: 0.6, ease: 'power2.out' });
  }

  // open the cover wide + a flutter before the panel appears
  onSelect() {
    const tl = gsap.timeline();
    tl.to(this.group.position, { y: this.baseY + 0.3, duration: 0.5, ease: 'power2.out' });
    tl.to(this.topCover.rotation, { z: -2.2, duration: 0.7, ease: 'back.out(1.6)' }, '<');
    tl.fromTo(this.glow.scale, { x: 1.1, y: 1.1 }, { x: 2.0, y: 2.0, duration: 0.7, ease: 'power2.out' }, '<');
    return tl;
  }

  reset() {
    gsap.to(this.group.position, { y: this.baseY, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(this.topCover.rotation, { z: 0, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(this.glow.scale, { x: 1.1, y: 1.1, duration: 0.5 });
  }

  update(delta, elapsed) {
    this.runes.forEach((r, i) => {
      const seed = r.userData.seed;
      const rad = r.userData.radius;
      r.position.x = Math.cos(elapsed * 0.6 + seed) * rad;
      r.position.z = Math.sin(elapsed * 0.6 + seed) * rad;
      r.position.y = 0.45 + Math.sin(elapsed * 1.3 + seed) * 0.12 + i * 0.02;
      r.material.opacity = 0.6 + Math.sin(elapsed * 2 + seed) * 0.3;
    });
    this.glow.material.rotation += delta * 0.5;
  }
}
