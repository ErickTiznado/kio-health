import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['kio.svg'],
      manifest: {
        name: 'Kio Health',
        short_name: 'Kio',
        description: 'Plataforma integral de gestión clínica',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'kio.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'kio.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**', 'src/stores/**', 'src/components/**', 'src/hooks/**'],
      exclude: ['src/test/**'],
    },
  },
});
