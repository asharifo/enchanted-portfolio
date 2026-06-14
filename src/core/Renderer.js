import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import Experience from './Experience.js';
import { renderer as cfg } from '../data/config.js';

// A gentle vignette + subtle filmic tint, applied in linear space before output.
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uStrength: { value: cfg.vignette },
    uTint: { value: new THREE.Color('#120c1f') },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    uniform vec3 uTint;
    varying vec2 vUv;
    void main(){
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 d = vUv - 0.5;
      float vig = smoothstep(0.85, 0.25, dot(d, d) * uStrength * 2.2);
      color.rgb = mix(uTint, color.rgb, clamp(vig + 0.15, 0.0, 1.0));
      gl_FragColor = color;
    }
  `,
};

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.usePost = !this.sizes.mobile; // keep mobile light-weight
    this.setInstance();
    this.setComposer();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = cfg.exposure;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.instance.setClearColor(cfg ? 0x0a0712 : 0x000000, 1);
  }

  setComposer() {
    if (!this.usePost) return;
    this.composer = new EffectComposer(this.instance);
    this.composer.setSize(this.sizes.width, this.sizes.height);
    this.composer.setPixelRatio(this.sizes.pixelRatio);

    this.renderPass = new RenderPass(this.scene, this.camera.instance);
    this.composer.addPass(this.renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      cfg.bloom.strength,
      cfg.bloom.radius,
      cfg.bloom.threshold
    );
    this.composer.addPass(this.bloomPass);

    this.vignettePass = new ShaderPass(VignetteShader);
    this.composer.addPass(this.vignettePass);

    this.composer.addPass(new OutputPass());
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    if (this.composer) {
      this.composer.setSize(this.sizes.width, this.sizes.height);
      this.composer.setPixelRatio(this.sizes.pixelRatio);
      this.bloomPass?.setSize(this.sizes.width, this.sizes.height);
    }
  }

  update() {
    if (this.composer) this.composer.render();
    else this.instance.render(this.scene, this.camera.instance);
  }
}
