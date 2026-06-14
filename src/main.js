import '../styles/main.scss';
import Experience from './core/Experience.js';

// Boot the world. Everything else hangs off this single singleton.
const canvas = document.querySelector('#webgl');
new Experience(canvas);
