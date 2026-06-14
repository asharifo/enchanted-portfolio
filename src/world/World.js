import * as THREE from 'three';
import Experience from '../core/Experience.js';
import Environment from './Environment.js';
import Room from './Room.js';
import Lantern from './Lantern.js';
import Scroll from './Scroll.js';
import Spellbook from './Spellbook.js';
import Backpack from './Backpack.js';
import Candles from './Candles.js';
import Particles from './Particles.js';
import gsap from 'gsap';
import { createHitbox } from './Hitboxes.js';
import { props as propCfg, renderer as rendererCfg, fog as fogCfg } from '../data/config.js';
import { lantern as lanternText } from '../data/content.js';

// Assembles the scene, wires the invisible hitboxes to camera + UI + audio,
// and owns the per-frame update of everything that lives in the room.
export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.camera = this.experience.camera;
    this.interactions = this.experience.interactions;
    this.audio = this.experience.audio;
    this.ui = this.experience.ui;

    this.ready = false;
    this.props = {};
    this.hitboxes = {};
    this.activePanel = null;
    this._flame = new THREE.Vector3();

    this.resources.on('ready', () => this.build());
  }

  build() {
    this.environment = new Environment();
    this.room = new Room(this.environment);

    this.props.lantern = new Lantern(this.environment);
    this.props.scroll = new Scroll(this.environment);
    this.props.spellbook = new Spellbook(this.environment);
    this.props.backpack = new Backpack(this.environment);

    this.candles = new Candles(this.environment);
    this.particles = new Particles();

    this.buildHitboxes();
    this.bindInteractions();

    this.ready = true;
    this.ui.onWorldReady();
  }

  buildHitboxes() {
    for (const [id, def] of Object.entries(propCfg)) {
      const hb = createHitbox({
        id,
        size: def.hitbox.size,
        position: def.position,
        offset: def.hitbox.offset,
        userData: { action: def.action, label: def.label, cameraView: def.cameraView },
      });
      this.scene.add(hb);
      this.interactions.register(hb);
      this.hitboxes[id] = hb;
    }
  }

  bindInteractions() {
    this.interactions.on('hover', (hb) => {
      const id = hb.userData.id;
      this.props[id]?.onHover(true);
      this.ui.showTooltip(hb.userData.label);
      this.audio.hoverTick();
    });

    this.interactions.on('hoverEnd', (hb) => {
      const id = hb.userData.id;
      this.props[id]?.onHover(false);
      this.ui.hideTooltip();
    });

    this.interactions.on('select', (hb) => {
      if (this.activePanel) return;
      const { id, action, label, cameraView } = hb.userData;
      const prop = this.props[id];

      if (action === 'lantern') {
        this.ringLantern();
        return;
      }

      // focus camera, then open the themed panel
      this.activePanel = action;
      this.interactions.setEnabled(false);
      this.ui.hideTooltip();
      this.props[id]?.onHover(false);
      this.audio.select(action);
      prop?.onSelect?.();

      this.camera.focusOn(cameraView, () => {
        this.ui.open(action, {
          title: label,
          onClose: () => this.closePanel(id, prop),
        });
      });
    });
  }

  // About panel — opened from the HUD rune-button, not a 3D prop.
  openAbout() {
    if (this.activePanel) return;
    this.activePanel = 'about';
    this.interactions.setEnabled(false);
    this.ui.hideTooltip();
    this.audio.select('about');
    this.ui.open('about', {
      title: 'About Me',
      onClose: () => {
        this.audio.close();
        this.interactions.setEnabled(true);
        this.activePanel = null;
      },
    });
  }

  ringLantern() {
    this.props.lantern.ring();
    this.props.lantern.getWorldFlame(this._flame);
    this.particles.burst(this._flame, undefined, 22);
    this.audio.chime(0.7);
    const whisper = lanternText.whispers[Math.floor(Math.random() * lanternText.whispers.length)];
    this.ui.toast(whisper);
  }

  closePanel(id, prop) {
    this.audio.close();
    prop?.reset?.();
    this.camera.returnHome(() => {
      this.interactions.setEnabled(true);
      this.activePanel = null;
    });
  }

  // called when the visitor presses "Enter the Nook"
  onEnter() {
    this.particles?.reveal();

    // "the lights come up": start dim & foggy, then brighten + thin the fog as
    // the camera arrives. Runs on exposure/fog so it never fights the per-frame
    // light flicker in the lantern/candles.
    const r = this.experience.renderer.instance;
    const fog = this.scene.fog;
    r.toneMappingExposure = 0.32;
    gsap.to(r, { toneMappingExposure: rendererCfg.exposure, duration: 3.4, ease: 'power2.inOut' });
    if (fog) {
      const target = fogCfg.density;
      fog.density = target * 1.9;
      gsap.to(fog, { density: target, duration: 3.4, ease: 'power2.inOut' });
    }
  }

  resize() {}

  update() {
    if (!this.ready) return;
    const { delta, elapsed } = this.experience.time;
    this.environment.update(elapsed);
    Object.values(this.props).forEach((p) => p.update?.(delta, elapsed));
    this.candles.update(delta, elapsed);
    this.particles.update(delta, elapsed);
  }
}
