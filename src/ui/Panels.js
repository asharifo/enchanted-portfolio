// Themed panel templates. Each returns an HTML string built from content.js,
// styled by SCSS into parchment / aged cards / rune grid / floating glass.
import { profile, experience, projects, skills } from '../data/content.js';

const tags = (arr) => `<ul class="tagrow">${arr.map((t) => `<li>${t}</li>`).join('')}</ul>`;

// WORK EXPERIENCE → ripped parchment / spellbook page
export function renderWork() {
  const entries = experience
    .map(
      (e, i) => `
      <article class="entry" style="--i:${i}">
        <div class="entry__head">
          <h3>${e.role}</h3>
          <span class="entry__period">${e.period}</span>
        </div>
        <p class="entry__org">${e.org}</p>
        <p class="entry__summary">${e.summary}</p>
        ${tags(e.tags)}
      </article>`
    )
    .join('<div class="entry__divider">❖</div>');

  return `
    <div class="parchment">
      <div class="parchment__seal">✦</div>
      <p class="eyebrow">Chronicle of</p>
      <h2 class="panel-title">Work Experience</h2>
      <div class="parchment__body">${entries}</div>
    </div>`;
}

// PROJECTS → stack of aged paper cards
export function renderProjects() {
  const cards = projects
    .map(
      (p, i) => `
      <article class="agecard" style="--accent:${p.accent}; --i:${i}">
        <div class="agecard__pin"></div>
        <h3>${p.name}</h3>
        <p>${p.blurb}</p>
        ${tags(p.tags)}
      </article>`
    )
    .join('');
  return `
    <p class="eyebrow">A Grimoire of</p>
    <h2 class="panel-title">Projects</h2>
    <p class="panel-sub">Aged pages, each a small spell I've cast.</p>
    <div class="agecards">${cards}</div>`;
}

// SKILLS → rune cards
export function renderSkills() {
  const cards = skills
    .map(
      (s, i) => `
      <div class="rune" style="--i:${i}; --lvl:${Math.round(s.level * 100)}%">
        <span class="rune__glyph">${s.rune}</span>
        <span class="rune__name">${s.name}</span>
        <span class="rune__bar"><i></i></span>
      </div>`
    )
    .join('');
  return `
    <p class="eyebrow">From the Satchel</p>
    <h2 class="panel-title">Skills &amp; Runes</h2>
    <p class="panel-sub">Tools and incantations I carry on every quest.</p>
    <div class="runes">${cards}</div>`;
}

// ABOUT → floating magical glass
export function renderAbout() {
  const links = profile.links
    .map((l) => `<a href="${l.href}" target="_blank" rel="noopener"><span>${l.glyph}</span>${l.label}</a>`)
    .join('');
  return `
    <div class="about">
      <div class="about__halo"></div>
      <p class="eyebrow">${profile.title}</p>
      <h2 class="panel-title">${profile.name}</h2>
      <p class="about__tagline">${profile.tagline}</p>
      <p class="about__blurb">${profile.blurb}</p>
      <p class="about__meta">${profile.location}</p>
      <div class="about__links">${links}</div>
    </div>`;
}

export const PANELS = {
  work: { render: renderWork, theme: 'work' },
  projects: { render: renderProjects, theme: 'projects' },
  skills: { render: renderSkills, theme: 'skills' },
  about: { render: renderAbout, theme: 'about' },
};
