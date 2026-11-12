import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Lets you open the dev server through a Cloudflare quick tunnel.
    // See the README.
    allowedHosts: ['.trycloudflare.com'],
  },
  optimizeDeps: {
    // Only needed inside the formsort/oss repository, where the package is
    // linked from source. Remove it when you install the package from npm.
    include: ['@formsort/web-embed-api'],
  },
});
