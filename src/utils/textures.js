import * as THREE from 'three';

// Soft radial-gradient sprite texture — the workhorse for glows, embers,
// fireflies and dust. Cached by colour so we don't rebuild identical canvases.
const cache = new Map();

export function radialSprite(color = '#ffffff', softness = 0.5) {
  const key = `${color}|${softness}`;
  if (cache.has(key)) return cache.get(key);

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  const c = new THREE.Color(color);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`;
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(softness, `rgba(${rgb},0.35)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}

// A small additive glow sprite, ready to drop into a scene.
export function makeGlow(color, scale = 1, opacity = 0.9) {
  const mat = new THREE.SpriteMaterial({
    map: radialSprite(color),
    color: 0xffffff,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(scale);
  return sprite;
}
