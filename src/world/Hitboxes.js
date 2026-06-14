import * as THREE from 'three';

// Shared geometry — one unit cube, scaled per hitbox.
const UNIT = new THREE.BoxGeometry(1, 1, 1);

// Toggle from the console: `localStorage.hitboxDebug = 1` then reload
// (or set `window.__HITBOX_DEBUG__ = true` before the world builds).
const DEBUG =
  typeof window !== 'undefined' &&
  (window.__HITBOX_DEBUG__ || (typeof localStorage !== 'undefined' && localStorage.getItem('hitboxDebug') === '1'));

// An invisible-but-raycastable box. It never moves with the animated visuals,
// so hover/click stay perfectly stable while the prop scales, sways or floats.
export function createHitbox({ id, size = [1, 1, 1], position = [0, 0, 0], offset = [0, 0, 0], userData = {} }) {
  const material = DEBUG
    ? new THREE.MeshBasicMaterial({ color: 0x00ffaa, wireframe: true, transparent: true, opacity: 0.5 })
    : new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });

  const mesh = new THREE.Mesh(UNIT, material);
  mesh.name = `hitbox:${id}`;
  mesh.scale.set(size[0], size[1], size[2]);
  mesh.position.set(
    position[0] + offset[0],
    position[1] + offset[1],
    position[2] + offset[2]
  );
  mesh.renderOrder = -1;
  mesh.userData = { type: 'interactive', id, ...userData };
  return mesh;
}
