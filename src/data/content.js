// ─────────────────────────────────────────────────────────────────────────
//  PORTFOLIO CONTENT  —  edit everything here. No 3D / layout code below.
//  Each section feeds a themed UI panel (parchment, tomes, rune cards…).
// ─────────────────────────────────────────────────────────────────────────

export const profile = {
  name: 'Amir Sharifov',
  title: 'AI / ML & Creative Engineer',
  tagline: 'Conjuring intelligent systems from a cozy enchanted nook.',
  blurb:
    'I build AI-driven and immersive software — from RAG chatbots and geospatial ' +
    'assistants to on-device computer-vision apps and interactive 3D worlds. ' +
    'I like work that blends rigorous machine learning with delightful, human-feeling design.',
  location: 'Vancouver, BC · University of British Columbia',
  email: 'asharifo@student.ubc.ca',
  links: [
    { label: 'Email', href: 'mailto:asharifo@student.ubc.ca', glyph: '✉' },
    { label: 'GitHub', href: 'https://github.com/', glyph: '⌥' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/', glyph: '✦' },
  ],
};

// ── WORK EXPERIENCE  → opened by the SCROLL (ripped parchment / spellbook page)
export const experience = [
  {
    role: 'AI & Automation Co-op',
    org: 'ATCO',
    period: '2025',
    summary:
      'Designed and shipped AI-powered automation that streamlines internal operations — ' +
      'building LLM workflows, data pipelines, and tooling that turn manual processes into ' +
      'self-running enchantments.',
    tags: ['LLMs', 'Automation', 'Python', 'Workflow Design'],
  },
  {
    role: 'Disaster-Risk RAG Chatbot & Regional Information Site',
    org: 'UNDP',
    period: '2024 – 2025',
    summary:
      'Built a retrieval-augmented chatbot and a regional disaster-information website that ' +
      'surfaces preparedness and risk guidance from a large knowledge base, making critical ' +
      'information accessible in plain language.',
    tags: ['RAG', 'LangChain', 'React', 'Knowledge Base'],
  },
  {
    role: 'Geospatial AI Engineer',
    org: 'Qala AI',
    period: '2024',
    summary:
      'Worked on geospatial AI — location intelligence and spatial reasoning that turns raw ' +
      'coordinates and GeoJSON into analytical answers and decision support.',
    tags: ['Geospatial', 'GeoJSON', 'Location Intelligence', 'AI'],
  },
  {
    role: 'Your Next Chapter',
    org: 'Placeholder — edit me',
    period: '—',
    summary:
      'An empty page in the spellbook, waiting for the next entry. Duplicate any block in ' +
      'src/data/content.js to add a new role.',
    tags: ['Editable'],
  },
];

// ── PROJECTS  → opened by the SPELLBOOK / TOMES (stack of aged paper cards)
export const projects = [
  {
    name: 'Enchanted Nook — 3D Portfolio',
    blurb:
      'This very world. An interactive Three.js room where the environment itself is the ' +
      'navigation, with raycast hitboxes, GSAP camera moves, post-processing glow and a ' +
      'procedural Web-Audio score.',
    tags: ['Three.js', 'GSAP', 'GLSL', 'Web Audio'],
    accent: '#ffb863',
  },
  {
    name: 'Hoops Vision — iOS Shot Analysis',
    blurb:
      'An iOS app that analyses basketball shots in real time using Apple Vision, Core ML and ' +
      'a YOLO detection model — tracking ball, rim and release to grade shot form.',
    tags: ['Swift', 'Vision', 'Core ML', 'YOLO'],
    accent: '#ff7a59',
  },
  {
    name: 'Disaster-Risk RAG Chatbot',
    blurb:
      'A retrieval-augmented assistant answering disaster-preparedness questions from a curated ' +
      'corpus, with a React front end and a LangChain + vector-store backend.',
    tags: ['React', 'Node', 'LangChain', 'AstraDB', 'OpenAI'],
    accent: '#7ec8ff',
  },
  {
    name: 'Credit Default Prediction',
    blurb:
      'An end-to-end ML pipeline predicting credit default — feature engineering, a Random ' +
      'Forest model and careful optimisation against the Average-Precision (AP) metric.',
    tags: ['scikit-learn', 'Feature Engineering', 'Random Forest', 'AP Metric'],
    accent: '#b894ff',
  },
  {
    name: 'Geospatial Analytical Assistant',
    blurb:
      'A spatial reasoning assistant that ingests GeoJSON and location data to answer ' +
      'analytical questions — bridging maps and language with location intelligence.',
    tags: ['GeoJSON', 'Location Intelligence', 'Python', 'AI'],
    accent: '#7affc1',
  },
];

// ── SKILLS  → opened by the BACKPACK / SATCHEL (rune cards)
export const skills = [
  { name: 'JavaScript / TypeScript', rune: 'ᛃ', level: 0.92 },
  { name: 'React / Vite', rune: 'ᚱ', level: 0.9 },
  { name: 'Three.js / Blender', rune: 'ᚦ', level: 0.82 },
  { name: 'Python', rune: 'ᛈ', level: 0.93 },
  { name: 'Machine Learning', rune: 'ᛗ', level: 0.88 },
  { name: 'LangChain / RAG', rune: 'ᛚ', level: 0.85 },
  { name: 'Node / Express', rune: 'ᚾ', level: 0.84 },
  { name: 'Swift / iOS', rune: 'ᛋ', level: 0.78 },
  { name: 'C++', rune: 'ᚲ', level: 0.75 },
];

// ── LANTERN  → flavour text shown briefly when the lantern is rung
export const lantern = {
  whispers: [
    'The lantern hums a warm, ancient note…',
    'Fireflies scatter from the flame.',
    'A soft chime echoes through the nook.',
    'The light remembers every traveller who passed through.',
  ],
};
