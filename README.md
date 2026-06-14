# ✦ The Enchanted Nook — an interactive 3D portfolio

A cozy, mystical treehouse study you can *wander*. The room itself is the
navigation: hover the glowing objects, click them, and themed parchment /
spellbook / rune panels unfurl. Built in the spirit of award-winning room-folio
sites, but with its own enchanted-nook identity.

Live experience highlights:

- A **Druid Crib** nook rendered in Three.js with warm lantern light, cool
  moonlight, blue-purple fog, bloom, and a vignette.
- A **swaying lantern** (pendulum physics) that pours warm light and rings with
  a chime + firefly burst on click.
- Four object interactions, each with hover shimmer, a cinematic camera move,
  and a themed UI panel:
  - 🪶 **Scroll → Work Experience** (rugged ripped parchment)
  - 📚 **Spellbook stack → Projects** (aged paper cards)
  - 🎒 **Satchel → Skills** (glowing rune cards)
  - ✦ **About** (floating magical glass — opened from the HUD)
- A fully **procedural Web-Audio score**: generative ambient pad + sparse
  pentatonic bells, plus synthesized SFX for every action. No audio files.
- Floating candles, drifting dust motes, twinkling fireflies.
- Responsive for desktop and mobile (post-processing + particle counts scale
  down automatically on small screens).

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # → dist/ (deployable anywhere; uses relative asset paths)
npm run preview   # serve the production build
```

Click **“Enter the Nook”** — that gesture is what unlocks audio (browsers block
autoplay), then the camera glides in and the particles awaken.

## Editing your content

Everything you'd want to change lives in **`src/data/content.js`** — no 3D code:

- `profile` — name, title, tagline, blurb, location, email, links
- `experience` — the Work Experience scroll (duplicate a block to add a role)
- `projects` — the Projects cards (each has an `accent` colour)
- `skills` — the rune cards (`rune` glyph + `level` 0–1 for the mastery bar)
- `lantern.whispers` — the little messages shown when the lantern is rung

## Tuning the scene

All spatial/feel values live in **`src/data/config.js`**:

- `camera.home` / `camera.introStart` — framing and the intro flight
- `props.*` — each interactive object's `position`, `scale`, `rotationY`, its
  invisible `hitbox` (size + offset), and the `cameraView` it flies to on click
- `palette`, `fog`, `renderer.bloom`, `particles`, `candles`

Hover/click feel staying steady while objects animate is no accident: raycasting
hits **only the static invisible hitboxes** (`src/world/Hitboxes.js`), never the
moving meshes. To visualize them, run `localStorage.hitboxDebug = 1` in the
console and reload — the boxes render as green wireframes.

## Project structure

```
index.html
src/
  main.js                 # boots the Experience singleton
  core/                   # engine: Sizes, Time, Camera, Renderer, Resources,
                          #         Interactions (raycaster), Experience
  world/                  # Room, Lantern, Scroll, Spellbook, Backpack,
                          #         Candles, Particles, Environment, Hitboxes, World
  ui/                     # UIManager (overlay mechanics) + Panels (templates)
  audio/AudioManager.js   # procedural Web-Audio engine
  data/                   # content.js (your info) + config.js (scene tuning)
  utils/                  # EventEmitter, texture helpers
styles/                   # SCSS: variables, base, loader, hud, panel, themes, responsive
public/models/            # room.glb, lanterns.glb, scroll.glb
```

## Asset notes

- **`room.glb`** is the `dae_crib_-_enchanted_nook` model. The original used the
  `KHR_materials_pbrSpecularGlossiness` extension, which modern Three.js
  GLTFLoader no longer supports — so it was converted to metallic-roughness with
  `@gltf-transform/cli metalrough`. It's a single inseparable model (scenery
  only); all interactivity is the props + hitboxes placed around it.
- **`lanterns.glb`** contains three lanterns; the European one is extracted at
  runtime for the hero swaying lantern.
- **`scroll.glb`** is the Work-Experience scroll.

The room is scaled to a target size at load (see `Room.js`) rather than a
hard-coded factor, because the export bakes a matrix scale into a wrapper node.

## Credits

Built with [Three.js](https://threejs.org), [GSAP](https://gsap.com), and Vite.
3D models are third-party assets dropped into `public/models/`.
