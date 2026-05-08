import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable fast refresh for development
      fastRefresh: true,
    }),
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,
    open: true,
    // Proxy API calls in development if needed
    // proxy: {
    //   "/api": "http://localhost:8080",
    // },
  },

  build: {
    outDir: "dist",
    sourcemap: false, // Disable sourcemaps in production for security
    minify: "esbuild",
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
    // Warn if chunk exceeds 500kb
    chunkSizeWarningLimit: 500,
  },

  preview: {
    port: 4173,
  },
});
