import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works on GitHub Pages under /<repo>/ as well as locally.
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
});
