import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import EventEmitter from '../utils/EventEmitter.js';

// Asset manifest. Audio is fully procedural (see AudioManager), so the only
// network payload here is geometry.
const SOURCES = [
  { name: 'room', type: 'gltf', path: './models/room-no-window.glb' },
  { name: 'lanterns', type: 'gltf', path: './models/lanterns.glb' },
  { name: 'scroll', type: 'gltf', path: './models/scroll.glb' },
];

export default class Resources extends EventEmitter {
  constructor() {
    super();
    this.sources = SOURCES;
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;
    this.progress = 0;

    this.loaders = { gltf: new GLTFLoader() };
    this.startLoading();
  }

  startLoading() {
    for (const source of this.sources) {
      if (source.type === 'gltf') {
        this.loaders.gltf.load(
          source.path,
          (file) => this.onLoaded(source, file),
          (xhr) => this.onProgress(source, xhr),
          (err) => this.onError(source, err)
        );
      }
    }
  }

  onLoaded(source, file) {
    this.items[source.name] = file;
    this.loaded += 1;
    this.progress = this.loaded / this.toLoad;
    this.trigger('progress', [this.progress, source.name]);
    if (this.loaded === this.toLoad) {
      // tiny beat so the loader's 100% state is actually seen
      setTimeout(() => this.trigger('ready'), 250);
    }
  }

  onProgress(source, xhr) {
    if (!xhr.lengthComputable) return;
    const partial = xhr.loaded / xhr.total;
    const overall = (this.loaded + partial) / this.toLoad;
    this.trigger('progress', [overall, source.name]);
  }

  onError(source, err) {
    console.error(`[Resources] failed to load "${source.name}"`, err);
    this.trigger('error', [source, err]);
  }
}

// Small helper used across world modules: recentre a model's geometry so the
// object's bounding box is centred on X/Z with its base at y=0, then return
// the measured size. Keeps placement maths sane across wildly different exports.
export function normalizeToBase(object3D) {
  const box = new THREE.Box3().setFromObject(object3D);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  object3D.position.x -= center.x;
  object3D.position.z -= center.z;
  object3D.position.y -= box.min.y;
  return { size, center, box };
}
