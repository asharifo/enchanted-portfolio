import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import Experience from '../core/Experience.js';
import { palette, fog } from '../data/config.js';

// Lighting + fog + a faint PBR environment. Aims for "moonlit nook lit mostly
// by one warm lantern": cool fill from above, warm bounce from below, deep fog.
export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer;
    this.sizes = this.experience.sizes;

    this.setFog();
    this.setLights();
    this.setEnvMap();
  }

  setFog() {
    this.scene.fog = new THREE.FogExp2(fog.color, fog.density);
    this.scene.background = new THREE.Color(fog.color);
  }

  setLights() {
    // cool sky / warm ground — the base mood
    this.hemi = new THREE.HemisphereLight(palette.moon, palette.ember, 0.45);
    this.scene.add(this.hemi);

    // soft cool "moonlight" through an imagined window — the only shadow caster
    this.moon = new THREE.DirectionalLight(palette.moon, 0.7);
    this.moon.position.set(-6, 9, 5);
    this.moon.castShadow = true;
    this.moon.shadow.mapSize.set(this.sizes.mobile ? 1024 : 2048, this.sizes.mobile ? 1024 : 2048);
    this.moon.shadow.camera.near = 1;
    this.moon.shadow.camera.far = 30;
    const s = 10;
    this.moon.shadow.camera.left = -s;
    this.moon.shadow.camera.right = s;
    this.moon.shadow.camera.top = s;
    this.moon.shadow.camera.bottom = -s;
    this.moon.shadow.bias = -0.0006;
    this.moon.shadow.normalBias = 0.025;
    this.moon.shadow.radius = 4;
    this.scene.add(this.moon);

    // warm low fill near the desk so the parchment props read warm
    this.warmFill = new THREE.PointLight(palette.lanternWarm, 3.4, 8, 1.8);
    this.warmFill.position.set(0.4, 2.2, 2.0);
    this.scene.add(this.warmFill);

    // faint magical rim from behind for separation
    this.rim = new THREE.PointLight(palette.rim, 4, 12, 2);
    this.rim.position.set(2, 4.5, -3);
    this.scene.add(this.rim);
  }

  setEnvMap() {
    // a dim neutral env gives metals/glass something to reflect without flattening mood
    const pmrem = new THREE.PMREMGenerator(this.renderer.instance);
    const env = new RoomEnvironment();
    this.envMap = pmrem.fromScene(env, 0.04).texture;
    this.scene.environment = this.envMap;
    pmrem.dispose();
  }

  // applied to every room/prop material so the env map stays subtle
  tuneMaterial(material) {
    if (!material) return;
    if ('envMapIntensity' in material) material.envMapIntensity = 0.28;
  }

  update(elapsed) {
    // gentle breathing of the warm fill so the room never feels static
    this.warmFill.intensity = 3.2 + Math.sin(elapsed * 1.7) * 0.4;
  }
}
