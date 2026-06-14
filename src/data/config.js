// ─────────────────────────────────────────────────────────────────────────
//  SCENE CONFIG  —  every tunable transform & feel value in one place.
//  Positions are in NORMALISED world units (after the room is scaled).
//  cameraView = where the camera flies to when an object is selected.
// ─────────────────────────────────────────────────────────────────────────

export const palette = {
  fog: '#1a1426',
  ambient: '#4a3b6b',
  lanternWarm: '#ffb35c',
  moon: '#8ea2ff',
  rim: '#b07bff',
  ember: '#ff8a3d',
  spark: '#ffd9a0',
  firefly: '#bdf7c4',
};

export const renderer = {
  exposure: 1.05,
  bloom: { strength: 0.62, radius: 0.55, threshold: 0.72 },
  vignette: 1.15,
};

export const fog = { color: palette.fog, density: 0.052 };

export const camera = {
  fov: 44,
  // where the camera rests once the intro finishes
  home: { pos: [6.0, 4.5, 7.8], target: [0, 2.5, 0.6] },
  // where the intro flight begins (far, low, dark)
  introStart: { pos: [11.5, 3.0, 13.5], target: [0, 2.4, 0.6] },
  limits: {
    minDistance: 3.4,
    maxDistance: 11.5,
    minPolar: 0.35, // radians from straight-up (keeps camera above floor)
    maxPolar: 1.5,
    // azimuth clamp keeps the viewer roughly in front of the nook
    minAzimuth: -1.15,
    maxAzimuth: 1.15,
  },
};

// Room model transform. Room.js scales the model so its largest dimension
// equals `targetSize` (robust to whatever scale is baked into the export),
// then centres on X/Z and drops its base to y=0.
export const room = {
  targetSize: 9.2,
  rotationY: 0,
  yOffset: 0,
};

// ── Interactive props ──────────────────────────────────────────────────────
// Each prop: model/build transform + an invisible hitbox + a camera view.
// `action` maps to a UI panel ('work' | 'projects' | 'skills' | 'about' | 'lantern').
export const props = {
  lantern: {
    action: 'lantern',
    label: 'Ring the Lantern',
    position: [0.15, 5.0, 1.25],
    rotationY: 0,
    scale: 0.19,
    hitbox: { size: [1.2, 1.6, 1.2], offset: [0, -0.1, 0] },
    cameraView: { pos: [3.0, 5.3, 4.6], target: [0.15, 4.9, 1.2] },
    swayAmplitude: 0.09, // radians
    swaySpeed: 0.5,
  },
  scroll: {
    action: 'work',
    label: 'Work Experience',
    position: [-0.45, 2.05, 1.65],
    rotationY: 0.5,
    rotationZ: 0,
    scale: 0.4,
    hitbox: { size: [1.1, 0.7, 0.8], offset: [0, 0.15, 0] },
    cameraView: { pos: [0.4, 2.9, 4.4], target: [-0.4, 2.1, 1.6] },
  },
  spellbook: {
    action: 'projects',
    label: 'Projects',
    position: [0.92, 1.64, 0.4],
    rotationY: -0.4,
    scale: 1,
    hitbox: { size: [1.3, 1.0, 1.1], offset: [0, 0.2, 0] },
    cameraView: { pos: [1.8, 2.7, 4.0], target: [0.9, 1.9, 0.35] },
  },
  backpack: {
    action: 'skills',
    label: 'Skills',
    position: [0.95, 0.4, 2.15],
    rotationY: 0.3,
    scale: 0.85,
    hitbox: { size: [1.0, 1.3, 0.9], offset: [0, 0.5, 0] },
    cameraView: { pos: [2.4, 1.7, 5.2], target: [0.95, 0.7, 2.1] },
  },
  // NOTE: "About" is surfaced as a HUD rune-button rather than a 3rd object on
  // the cluttered desk — keeps the in-room navigation to the four hero props.
};

// `size` is the point-size base fed straight to the shader (already accounts
// for perspective + pixel ratio there), so keep these small.
export const particles = {
  dust: { count: 300, area: [13, 9, 13], size: 0.06, speed: 0.05 },
  fireflies: { count: 24, area: [10, 5.5, 8], size: 0.32, speed: 0.25 },
  // reduced automatically on small screens (see World.js)
  mobileScale: 0.55,
};

export const candles = [
  { position: [-2.0, 2.12, 1.0], scale: 0.5 },
  { position: [2.2, 2.1, 0.7], scale: 0.45 },
  { position: [0.2, 0.02, 2.6], scale: 0.6 },
];
