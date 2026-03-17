import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimization for Vercel & faster builds
    target: "esnext",
    minify: "esbuild",
    esbuild: {
      drop: ["console", "debugger"],
    },
    // Optimal chunk sizing for faster loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-tabs",
          ],
          "vendor-form": ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-utils": ["axios", "clsx", "tailwind-merge", "date-fns"],
        },
      },
    },
    // Compression & performance settings
    reportCompressedSize: false, // Faster build
    cssCodeSplit: true,
    sourcemap: false, // Disable sourcemaps in production
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true,
  },
  // Optimization hints
  define: {
    __DEV__: false,
  },
}));
