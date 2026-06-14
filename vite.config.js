import { defineConfig } from 'vite';

// Enchanted Nook — Vite configuration
// `base: './'` keeps asset URLs relative so the built site can be hosted
// from any sub-path (GitHub Pages, Netlify drop, etc.).
export default defineConfig({
  base: './',
  root: '.',
  publicDir: 'public',
  server: {
    host: true,
    port: 5173,
    open: false,
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern' },
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
        },
      },
    },
  },
});
