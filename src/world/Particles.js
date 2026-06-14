import * as THREE from 'three';
import gsap from 'gsap';
import Experience from '../core/Experience.js';
import { radialSprite } from '../utils/textures.js';
import { particles as cfg, palette } from '../data/config.js';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aScale;
  attribute float aSpeed;
  attribute float aPhase;
  varying float vTwinkle;
  void main(){
    vec3 pos = position;
    pos.y += sin(uTime * aSpeed + aPhase) * 0.35;
    pos.x += cos(uTime * aSpeed * 0.7 + aPhase) * 0.25;
    pos.z += sin(uTime * aSpeed * 0.5 + aPhase * 1.3) * 0.25;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uSize * uPixelRatio * (300.0 / -mv.z);
    vTwinkle = 0.45 + 0.55 * sin(uTime * 2.0 * aSpeed + aPhase * 3.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform sampler2D uTex;
  varying float vTwinkle;
  void main(){
    float a = texture2D(uTex, gl_PointCoord).a;
    gl_FragColor = vec4(uColor, a * vTwinkle * uOpacity);
  }
`;

// Dust motes + fireflies (GPU-animated Points) plus an on-demand firefly burst.
export default class Particles {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;

    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.fields = [];
    this.bursts = [];

    const m = this.sizes.mobile ? cfg.mobileScale : 1;
    this.dust = this.makeField({
      count: Math.round(cfg.dust.count * m),
      area: cfg.dust.area,
      color: palette.spark,
      size: cfg.dust.size,
      opacity: 0.45,
      speedRange: [0.1, 0.35],
      scaleRange: [0.3, 1],
    });
    this.fireflies = this.makeField({
      count: Math.round(cfg.fireflies.count * m),
      area: cfg.fireflies.area,
      yBase: 1.2,
      color: palette.firefly,
      size: cfg.fireflies.size,
      opacity: 0.9,
      speedRange: [0.3, 0.7],
      scaleRange: [0.6, 1.3],
    });
  }

  makeField({ count, area, color, size, opacity, speedRange, scaleRange, yBase = 0 }) {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area[0];
      positions[i * 3 + 1] = yBase + Math.random() * area[1];
      positions[i * 3 + 2] = (Math.random() - 0.5) * area[2];
      scales[i] = THREE.MathUtils.lerp(scaleRange[0], scaleRange[1], Math.random());
      speeds[i] = THREE.MathUtils.lerp(speedRange[0], speedRange[1], Math.random());
      phases[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: size },
        uOpacity: { value: 0 }, // fade in on enter
        uColor: { value: new THREE.Color(color) },
        uPixelRatio: { value: this.sizes.pixelRatio },
        uTex: { value: radialSprite('#ffffff') },
      },
    });
    mat.userData.targetOpacity = opacity;

    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    this.group.add(points);
    this.fields.push(points);
    return points;
  }

  // fade particles in once the visitor enters
  reveal() {
    this.fields.forEach((p) => {
      gsap.to(p.material.uniforms.uOpacity, {
        value: p.material.userData.targetOpacity,
        duration: 3,
        ease: 'power2.out',
      });
    });
  }

  // a short-lived burst of fireflies from a world position (lantern ring)
  burst(position, color = palette.firefly, n = 20) {
    const tex = radialSprite(color);
    for (let i = 0; i < n; i++) {
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const s = new THREE.Sprite(mat);
      s.scale.setScalar(0.18 + Math.random() * 0.12);
      s.position.copy(position);
      this.scene.add(s);

      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.4 + 0.2,
        (Math.random() - 0.5) * 2
      ).normalize();
      const dist = 0.6 + Math.random() * 1.1;
      gsap.to(s.position, {
        x: position.x + dir.x * dist,
        y: position.y + dir.y * dist,
        z: position.z + dir.z * dist,
        duration: 1.2 + Math.random() * 0.8,
        ease: 'power2.out',
      });
      gsap.to(s.material, {
        opacity: 0,
        duration: 1.4 + Math.random() * 0.6,
        ease: 'power2.in',
        onComplete: () => {
          this.scene.remove(s);
          s.material.dispose();
        },
      });
    }
  }

  update(delta, elapsed) {
    this.fields.forEach((p) => (p.material.uniforms.uTime.value = elapsed));
  }
}
