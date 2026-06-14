import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import Experience from '../core/Experience.js';
import { makeGlow } from '../utils/textures.js';
import { props, palette } from '../data/config.js';

const leather = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05 });

// Skills prop — a cozy adventurer's satchel. The buckle + rune emblem glow,
// the flap lifts on hover and flings open on select.
export default class Backpack {
  constructor(environment) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.environment = environment;
    this.cfg = props.skills || props.backpack;

    this.group = new THREE.Group();
    this.group.name = 'BackpackGroup';
    this.scene.add(this.group);
    this.build();
  }

  build() {
    const bodyMat = leather('#5a3b27');
    const darkMat = leather('#3f291a');
    const strapMat = leather('#4a3120');
    const metal = new THREE.MeshStandardMaterial({
      color: '#caa24a',
      roughness: 0.4,
      metalness: 0.8,
      emissive: new THREE.Color('#caa24a'),
      emissiveIntensity: 0.3,
    });

    this.body = new THREE.Group();

    const main = new THREE.Mesh(new RoundedBoxGeometry(0.95, 1.15, 0.66, 4, 0.12), bodyMat);
    main.position.y = 0.6;

    // front pocket
    const pocket = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.5, 0.22, 4, 0.08), darkMat);
    pocket.position.set(0, 0.32, 0.34);

    // side bottle pockets
    const sidePocketGeo = new RoundedBoxGeometry(0.18, 0.5, 0.4, 4, 0.07);
    const sideL = new THREE.Mesh(sidePocketGeo, darkMat);
    sideL.position.set(-0.5, 0.4, 0.0);
    const sideR = sideL.clone();
    sideR.position.x = 0.5;

    // flap pivots at the back-top
    this.flap = new THREE.Group();
    this.flap.position.set(0, 1.16, -0.33);
    const flapMesh = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.55, 0.12, 4, 0.08), darkMat);
    flapMesh.position.set(0, -0.18, 0.36);
    flapMesh.rotation.x = Math.PI / 2;
    // rune emblem on the flap
    this.emblem = new THREE.Mesh(new THREE.CircleGeometry(0.14, 24), metal);
    this.emblem.position.set(0, -0.34, 0.42);
    this.buckle = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.1, 0.06, 3, 0.02), metal);
    this.buckle.position.set(0, -0.02, 0.42);
    this.flap.add(flapMesh, this.emblem, this.buckle);

    // shoulder strap (a flattened torus arc behind the body)
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 8, 24, Math.PI), strapMat);
    strap.position.set(0.18, 0.75, -0.34);
    strap.rotation.set(Math.PI / 2, 0, 0.2);
    strap.scale.set(0.7, 1, 1.3);

    this.body.add(main, pocket, sideL, sideR, strap, this.flap);
    this.body.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        this.environment?.tuneMaterial(c.material);
      }
    });
    this.group.add(this.body);

    // glow from the emblem
    this.glow = makeGlow(palette.spark, 0.7, 0.5);
    this.glow.position.set(0, 0.85, 0.45);
    this.group.add(this.glow);

    this.group.position.set(...this.cfg.position);
    this.group.rotation.y = this.cfg.rotationY;
    this.group.scale.setScalar(this.cfg.scale || 1);
    this.baseY = this.group.position.y;
  }

  onHover(state) {
    gsap.to(this.body.scale, {
      x: state ? 1.06 : 1,
      y: state ? 1.06 : 1,
      z: state ? 1.06 : 1,
      duration: 0.45,
      ease: 'power2.out',
    });
    gsap.to(this.group.position, { y: this.baseY + (state ? 0.08 : 0), duration: 0.45, ease: 'power2.out' });
    gsap.to(this.flap.rotation, { x: state ? -0.4 : 0, duration: 0.5, ease: 'power2.out' });
    gsap.to(this.glow.material, { opacity: state ? 0.95 : 0.5, duration: 0.4 });
  }

  onSelect() {
    const tl = gsap.timeline();
    tl.to(this.group.position, { y: this.baseY + 0.25, duration: 0.5, ease: 'power2.out' });
    tl.to(this.flap.rotation, { x: -1.7, duration: 0.6, ease: 'back.out(1.5)' }, '<');
    tl.fromTo(this.glow.scale, { x: 0.7, y: 0.7 }, { x: 1.6, y: 1.6, duration: 0.6, ease: 'power2.out' }, '<');
    return tl;
  }

  reset() {
    gsap.to(this.group.position, { y: this.baseY, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(this.flap.rotation, { x: 0, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(this.glow.scale, { x: 0.7, y: 0.7, duration: 0.5 });
  }

  update(delta, elapsed) {
    this.glow.material.opacity = 0.45 + Math.sin(elapsed * 2.2) * 0.18;
    this.emblem.rotation.z += delta * 0.4;
  }
}
