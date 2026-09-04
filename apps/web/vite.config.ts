import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  // Permite levantar una segunda instancia de dev en paralelo (p. ej. una
  // sesión de QA mientras otra ya ocupa el 5173) sin editar la config.
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'Kio Health',
        short_name: 'Kio',
        description: 'Plataforma integral de gestión clínica',
        theme_color: '#ffffff',
        icons: [
          { src: 'logo.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Check most-specific paths first to avoid mis-classification
          if (id.includes('@sentry/'))                                              return 'sentry';
          if (id.includes('recharts') || id.includes('/node_modules/d3-'))         return 'recharts';
          if (id.includes('framer-motion') || id.includes('@motionone/'))          return 'framer-motion';
          if (id.includes('@tanstack/'))                                            return 'tanstack';
          if (id.includes('/node_modules/zod/') ||
              id.includes('react-hook-form') ||
              id.includes('@hookform/'))                                            return 'form-validation';
          if (id.includes('/node_modules/date-fns/'))                              return 'date-utils';
          if (id.includes('lucide-react') ||
              id.includes('/node_modules/sonner/'))                                return 'ui-primitives';
          if (id.includes('/node_modules/react/') ||
              id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/react-router') ||
              id.includes('/node_modules/scheduler/'))                             return 'react-core';
        },
      },
    },
  },
});
