import * as THREE from 'three';
import Sizes from './Sizes.js';
import Time from './Time.js';
import Camera from './Camera.js';
import Renderer from './Renderer.js';
import Resources from './Resources.js';
import Interactions from './Interactions.js';
import World from '../world/World.js';
import AudioManager from '../audio/AudioManager.js';
import UIManager from '../ui/UIManager.js';

let instance = null;

// The singleton spine. Every other module does `new Experience()` to grab the
// shared canvas / scene / camera / clock without prop-drilling.
export default class Experience {
  constructor(canvas) {
    if (instance) return instance;
    instance = this;
    window.experience = this; // handy for tuning from the console

    this.canvas = canvas;
    this.started = false;

    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.interactions = new Interactions();
    this.audio = new AudioManager();
    this.ui = new UIManager();
    this.world = new World();

    this.sizes.on('resize', () => this.resize());
    this.time.on('tick', () => this.update());
  }

  // Called by the loader's "Enter the Nook" button (a real user gesture, so
  // audio is allowed to start). Kicks off the cinematic intro.
  start() {
    if (this.started) return;
    this.started = true;
    this.audio.start();
    this.world.onEnter();
    this.camera.playIntro(() => {
      this.interactions.setEnabled(true);
      this.ui.onIntroComplete();
      this.audio.chime(0.4);
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
    this.world?.resize();
  }

  update() {
    this.camera.update();
    this.world?.update();
    this.interactions.update();
    this.renderer.update();
  }
}
