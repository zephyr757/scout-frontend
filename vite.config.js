import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // For custom domain
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production
    minify: 'esbuild', // Use esbuild instead of terser (faster and included)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'lucide-react']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',              // Expose to LAN
    port: 5173,
    strictPort: true,             // Lock to 5173 (helps proxy)
    origin: 'https://scout.ozdust.me', // Match the proxy URL exactly

    hmr: {
      protocol: 'wss',            // WebSocket over HTTPS
      host: 'scout.ozdust.me',
      port: 443,
    },
  },
})