import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [devtools(), solidPlugin(), tailwindcss()],
  resolve: {
    alias: {
      "@assets": resolve(__dirname, "./src/assets"),
      "@consts": resolve(__dirname, "./src/consts"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@enums": resolve(__dirname, "./src/enums"),
      "@types": resolve(__dirname, "./src/types"),
      "@images": resolve(__dirname, "./src/assets/images"),
      "@interfaces": resolve(__dirname, "./src/interfaces"),
      "@contexts": resolve(__dirname, "./src/contexts"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@services": resolve(__dirname, "./src/services"),
      "@components": resolve(__dirname, "./src/components"),
      "@layouts": resolve(__dirname, "./src/layouts"),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          solid: ["solid-js", "solid-js/web", "solid-js/store"],
          axios: ["axios"],
          fortawesome: [
            "@fortawesome/fontawesome-free/css/all.min.css",
            "@fortawesome/fontawesome-free/js/fontawesome.min.js",
            "@fortawesome/fontawesome-free/js/brands.min.js",
            "@fortawesome/fontawesome-free/js/solid.min.js",
          ],
          noscript: ["@assets/styles/noscript.css"],
        },
      },
    },
  },
});
