import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    commonjsOptions: {
      include: ["tailwind.config.js", "node_modules/**"],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
  // Split each heavy library into its own separate file
  // so they only load when that page is actually visited
  if (id.includes('@ckeditor')) return 'chunk-ckeditor'
  if (id.includes('@fullcalendar')) return 'chunk-fullcalendar'
  if (id.includes('leaflet')) return 'chunk-leaflet'
  if (id.includes('tabulator-tables')) return 'chunk-tabulator'
  if (id.includes('highlight.js')) return 'chunk-highlight'
  if (id.includes('lucide-react')) return 'chunk-lucide'
  if (id.includes('lodash')) return 'chunk-lodash'
  if (id.includes('node_modules')) return 'vendor'
},
      },
    },
  },
  optimizeDeps: {
    include: ["tailwind-config"],
  },
  plugins: [
    react(),
    visualizer({ open: true }), // 👈 opens the map in browser after build
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "tailwind-config": fileURLToPath(
        new URL("./tailwind.config.js", import.meta.url)
      ),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://qfshaven.site",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});