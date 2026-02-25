
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['@formsort/constants', 'events'],
  },
  build: {
    minify: 'terser',
    lib: {
      entry: 'src/index.ts',
      formats: ['umd'],
      fileName: () => 'custom-question-api.min.js',
      name: 'formsort',
    },
    rollupOptions: {
      external: [],
      output: {},
    },
    commonjsOptions: {
      include: [/constants/, /events/],
    },
    outDir: 'umd',
  },
});
