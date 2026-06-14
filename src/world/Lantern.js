import * as THREE from 'three';
import gsap from 'gsap';
import Experience from '../core/Experience.js';
import { makeGlow } from '../utils/textures.js';
import { props, palette } from '../data/config.js';

const PIVOT_HEIGHT = 0.9; // chain length above the lantern's resting centre

// The hero prop: a European lantern hung from above that sways like a pendulum,
// pours warm magical light, and rings with a chime + firefly burst on click.
export default class Lantern {
  constructor(environment) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.sizes = this.experience.sizes;
    this.environment = environment;
    this.cfg = props.lantern;

    this.baseLightIntensity = 14;
    this.hovering = false;

    this.build();
  }

  build() {
    const [x, y, z] = this.cfg.position;

    this.pivot = new THREE.Group(); // the fixed ceiling anchor
    this.pivot.position.set(x, y + PIVOT_HEIGHT, z);
    this.scene.add(this.pivot);

    this.swing = new THREE.Group(); // everything that swings hangs off here
    this.pivot.add(this.swing);

    this.extractModel();
    this.addChain();
    this.addLight();
    this.addGlow();
  }

  extractModel() {
    const source = this.resources.items.lanterns.scene;
    const euro = source.getObjectByName('EuropeanLantern');
    this.model = (euro || source).clone(true);
    this.model.scale.setScalar(this.cfg.scale);
    this.model.rotation.y = this.cfg.rotationY;

    // recentre so the lantern's centre sits PIVOT_HEIGHT below the anchor
    const box = new THREE.Box3().setFromObject(this.model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    this.model.position.x -= center.x;
    this.model.position.z -= center.z;
    this.model.position.y = -PIVOT_HEIGHT - center.y;

    this.model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        this.environment?.tuneMaterial(m);
        // make the glass panes glow so bloom catches the flame
        if (/glass/i.test(m.name || '') || /glass/i.test(child.name)) {
          m.emissive = new THREE.Color(palette.lanternWarm);
          m.emissiveIntensity = 2.2;
          m.transparent = true;
          m.opacity = 0.85;
        }
      });
    });

    this.swing.add(this.model);
    this.modelBaseScale = this.cfg.scale;
  }

  addChain() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a2330, roughness: 0.7, metalness: 0.8 });
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, PIVOT_HEIGHT, 6), mat);
    chain.position.y = -PIVOT_HEIGHT / 2;
    this.swing.add(chain);
  }

  addLight() {
    this.light = new THREE.PointLight(palette.lanternWarm, this.baseLightIntensity, 14, 1.7);
    this.light.position.set(0, -PIVOT_HEIGHT, 0);
    if (!this.sizes.mobile) {
      this.light.castShadow = true;
      this.light.shadow.mapSize.set(1024, 1024);
      this.light.shadow.bias = -0.004;
      this.light.shadow.camera.far = 16;
    }
    this.swing.add(this.light);
  }

  addGlow() {
    this.glow = makeGlow(palette.lanternWarm, 2.4, 0.85);
    this.glow.position.set(0, -PIVOT_HEIGHT, 0);
    this.swing.add(this.glow);
  }

  onHover(state) {
    this.hovering = state;
    gsap.to(this.model.scale, {
      x: this.modelBaseScale * (state ? 1.1 : 1),
      y: this.modelBaseScale * (state ? 1.1 : 1),
      z: this.modelBaseScale * (state ? 1.1 : 1),
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(this.glow.material, { opacity: state ? 1.0 : 0.85, duration: 0.4 });
  }

  // Called on click: a warm pulse + a little kick to the swing. The firefly
  // burst + chime are fired by World so they can use shared systems.
  ring() {
    gsap.killTweensOf(this.light);
    gsap.fromTo(
      this.light,
      { intensity: this.baseLightIntensity * 2.4 },
      { intensity: this.baseLightIntensity, duration: 1.4, ease: 'power2.out' }
    );
    gsap.fromTo(this.glow.scale, { x: 3.4, y: 3.4 }, { x: 2.4, y: 2.4, duration: 1.2, ease: 'power2.out' });
    // nudge the pendulum
    this._swingKick = (this._swingKick || 0) + 0.16;
    gsap.to(this, { _swingKick: 0, duration: 2.2, ease: 'power1.out' });
  }

  // world point at the lantern flame (for spawning the firefly burst)
  getWorldFlame(target = new THREE.Vector3()) {
    this.glow.getWorldPosition(target);
    return target;
  }

  update(delta, elapsed) {
    const a = this.cfg.swayAmplitude;
    const s = this.cfg.swaySpeed;
    const kick = this._swingKick || 0;
    this.swing.rotation.z = Math.sin(elapsed * s) * (a + kick);
    this.swing.rotation.x = Math.sin(elapsed * s * 0.73 + 1.1) * a * 0.5;

    // candle-like flicker on the light + glow
    const flicker = 0.85 + Math.sin(elapsed * 17) * 0.06 + Math.sin(elapsed * 7.3) * 0.05;
    if (!gsap.isTweening(this.light)) this.light.intensity = this.baseLightIntensity * flicker;
    this.glow.material.rotation += delta * 0.4;
  }
}
