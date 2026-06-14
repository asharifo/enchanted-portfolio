import * as THREE from 'three';
import Experience from '../core/Experience.js';
import { makeGlow } from '../utils/textures.js';
import { candles as cfg, palette } from '../data/config.js';

// Small floating candles that bob gently and flicker — pure atmosphere.
export default class Candles {
  constructor(environment) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.environment = environment;
    this.items = [];
    this.build();
  }

  build() {
    const waxMat = new THREE.MeshStandardMaterial({ color: '#e8dcc0', roughness: 0.9 });
    const flameMat = new THREE.MeshStandardMaterial({
      color: palette.spark,
      emissive: new THREE.Color(palette.ember),
      emissiveIntensity: 3,
    });

    cfg.forEach((c, i) => {
      const group = new THREE.Group();
      group.position.set(...c.position);
      group.scale.setScalar(c.scale);

      const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.42, 10), waxMat);
      wax.position.y = 0.21;
      wax.castShadow = true;
      wax.receiveShadow = true;

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.16, 8), flameMat);
      flame.position.y = 0.5;

      const glow = makeGlow(palette.lanternWarm, 0.6, 0.9);
      glow.position.y = 0.5;

      const light = new THREE.PointLight(palette.lanternWarm, 2.2, 3.2, 2);
      light.position.y = 0.55;

      group.add(wax, flame, glow, light);
      this.environment?.tuneMaterial(waxMat);
      this.scene.add(group);

      this.items.push({
        group,
        flame,
        glow,
        light,
        baseY: c.position[1],
        seed: i * 1.7 + Math.random(),
        bob: 0.04 + Math.random() * 0.03,
      });
    });
  }

  update(delta, elapsed) {
    this.items.forEach((it) => {
      it.group.position.y = it.baseY + Math.sin(elapsed * 1.1 + it.seed) * it.bob;
      const f = 0.8 + Math.sin(elapsed * 19 + it.seed) * 0.12 + Math.sin(elapsed * 8.5 + it.seed) * 0.08;
      it.light.intensity = 2.2 * f;
      it.flame.scale.y = f;
      it.glow.material.opacity = 0.7 * f + 0.2;
    });
  }
}
