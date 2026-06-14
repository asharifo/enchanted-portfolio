import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import Experience from './Experience.js';
import { camera as cfg } from '../data/config.js';

// Perspective camera + constrained OrbitControls. Owns the cinematic intro
// flight and the focus/return tweens used when a prop is selected.
export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.focused = false;
    this.introPlaying = false;

    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      cfg.fov,
      this.sizes.width / this.sizes.height,
      0.1,
      120
    );
    // begin at the intro start so the very first frame is already "outside"
    this.instance.position.set(...cfg.introStart.pos);
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.6;
    this.controls.target.set(...cfg.introStart.target);

    const l = cfg.limits;
    this.controls.minDistance = l.minDistance;
    this.controls.maxDistance = l.maxDistance;
    this.controls.minPolarAngle = l.minPolar;
    this.controls.maxPolarAngle = l.maxPolar;
    this.controls.minAzimuthAngle = l.minAzimuth;
    this.controls.maxAzimuthAngle = l.maxAzimuth;
    this.controls.enabled = false; // unlocked after the intro
  }

  // Cinematic entry: glide from the dark far position into the resting home view.
  playIntro(onComplete) {
    this.introPlaying = true;
    const tl = gsap.timeline({
      onComplete: () => {
        this.introPlaying = false;
        this.controls.enabled = true;
        onComplete?.();
      },
    });
    tl.to(this.instance.position, {
      x: cfg.home.pos[0],
      y: cfg.home.pos[1],
      z: cfg.home.pos[2],
      duration: 3.4,
      ease: 'power2.inOut',
    });
    tl.to(
      this.controls.target,
      {
        x: cfg.home.target[0],
        y: cfg.home.target[1],
        z: cfg.home.target[2],
        duration: 3.4,
        ease: 'power2.inOut',
      },
      '<'
    );
    return tl;
  }

  // Fly toward a prop's framing, then run onArrive (UIManager opens the panel).
  focusOn(view, onArrive) {
    this.focused = true;
    this.controls.enabled = false;
    gsap.killTweensOf(this.instance.position);
    gsap.killTweensOf(this.controls.target);

    const tl = gsap.timeline({ onComplete: () => onArrive?.() });
    tl.to(this.instance.position, {
      x: view.pos[0],
      y: view.pos[1],
      z: view.pos[2],
      duration: 1.5,
      ease: 'power3.inOut',
    });
    tl.to(
      this.controls.target,
      {
        x: view.target[0],
        y: view.target[1],
        z: view.target[2],
        duration: 1.5,
        ease: 'power3.inOut',
      },
      '<'
    );
    return tl;
  }

  // Drift back to the resting home view and re-enable free orbit.
  returnHome(onComplete) {
    gsap.killTweensOf(this.instance.position);
    gsap.killTweensOf(this.controls.target);
    const tl = gsap.timeline({
      onComplete: () => {
        this.focused = false;
        this.controls.enabled = true;
        onComplete?.();
      },
    });
    tl.to(this.instance.position, {
      x: cfg.home.pos[0],
      y: cfg.home.pos[1],
      z: cfg.home.pos[2],
      duration: 1.3,
      ease: 'power3.inOut',
    });
    tl.to(
      this.controls.target,
      {
        x: cfg.home.target[0],
        y: cfg.home.target[1],
        z: cfg.home.target[2],
        duration: 1.3,
        ease: 'power3.inOut',
      },
      '<'
    );
    return tl;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
