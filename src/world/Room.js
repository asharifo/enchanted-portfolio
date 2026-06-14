import * as THREE from 'three';
import Experience from '../core/Experience.js';
import { normalizeToBase } from '../core/Resources.js';
import { room as cfg } from '../data/config.js';

// Loads the "Druid Crib" nook. It's a single inseparable model, so it's purely
// scenery — all interaction lives on the props + hitboxes placed around it.
export default class Room {
  constructor(environment) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.environment = environment;

    this.group = new THREE.Group();
    this.group.name = 'RoomGroup';
    this.scene.add(this.group);

    this.build();
  }

  build() {
    const gltf = this.resources.items.room;
    this.model = gltf.scene;
    this.model.rotation.y = cfg.rotationY;
    this.group.add(this.model);

    // Scale so the largest dimension == targetSize. Sketchfab exports bake a
    // matrix scale into a wrapper node, so we measure first and never trust a
    // hard-coded factor.
    const measured = new THREE.Box3().setFromObject(this.group);
    const span = new THREE.Vector3();
    measured.getSize(span);
    const maxDim = Math.max(span.x, span.y, span.z) || 1;
    this.group.scale.setScalar(cfg.targetSize / maxDim);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          this.environment?.tuneMaterial(m);
          // spec→metal conversion can flag BLEND; the crib is solid, so force opaque
          m.transparent = false;
          m.depthWrite = true;
          if ('roughness' in m) m.roughness = Math.min(1, (m.roughness ?? 1) * 1.05 + 0.05);
        });
      }
    });

    // centre on X/Z, base to y=0, then apply any manual y offset
    const { size } = normalizeToBase(this.group);
    this.group.position.y += cfg.yOffset;
    this.size = size;
  }
}
