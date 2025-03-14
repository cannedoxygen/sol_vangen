// Vite configurationimport { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Resolve paths
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  // Configure public directory for static assets
  publicDir: 'public',
  
  // Configure build output
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate source maps for easier debugging
    sourcemap: true,
    
    // Optimize output
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-wasm': ['src/lib/vanityGenerator.js'],
        },
      },
    },
  },
  
  // Configure server options
  server: {
    port: 3000,
    open: true,
    cors: true,
    
    // Configure headers to allow WASM
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  
  // Configure WebAssembly loading
  optimizeDeps: {
    exclude: ['src/wasm'],
  },
  
  // Enable worker modules for web workers
  worker: {
    format: 'es',
  },
  
  // Add explicit support for WebAssembly
  experimental: {
    asyncWebAssembly: true,
  },
});