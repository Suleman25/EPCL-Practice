import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    strictPort: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Polyfill aliases for browser builds
      "buffer/": "buffer",
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    include: ["react-plotly.js", "plotly.js", "plotly.js-dist-min", "buffer"],
    force: true,
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    // Provide a minimal process.env shim for libraries expecting it
    "process.env": {},
    global: "globalThis",
  },
}));
