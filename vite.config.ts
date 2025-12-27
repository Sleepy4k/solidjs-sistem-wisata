import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    devtools({
      autoname: true,
      locator: {
        targetIDE: "vscode",
        componentLocation: true,
        jsxLocation: true,
      },
    }),
    solidPlugin(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@assets": resolve(__dirname, "./src/assets"),
      "@consts": resolve(__dirname, "./src/consts"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@enums": resolve(__dirname, "./src/enums"),
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
    chunkSizeWarningLimit: 175,
    rollupOptions: {
      output: {
        manualChunks: {
          solid: ["solid-js", "solid-js/web", "solid-js/store"],
          axios: ["axios"],
          "fort-awesome": ["@fortawesome/free-solid-svg-icons/index.js"],
          noscript: ["@assets/styles/noscript.css"],
          "dashboard-layout": ["@layouts/dashboard.layout.tsx"],
          "auth-layout": ["@layouts/auth.layout.tsx"],
          "error-layout": ["@layouts/error.layout.tsx"],
          header: ["@components/Header.tsx"],
          sidebar: ["@components/Sidebar.tsx"],
          nprogress: ["nprogress", "@assets/styles/nprogress.css"],
          "data-table": ["@components/DataTable.tsx"],
          table: ["@tanstack/solid-table"],
          parse: ["@utils/parse.ts"],
          storage: ["@utils/storage.ts"],
        },
      },
    },
  },
});
