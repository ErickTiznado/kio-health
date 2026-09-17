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
      /**
       * QUE SE GUARDA EN CACHE Y QUE NO.
       *
       * Sin esta seccion, vite-plugin-pwa precacheaba el build entero: 39
       * ficheros, 2.590 KB. Un desconocido que abria la landing desde un
       * anuncio se descargaba en segundo plano Sentry, la libreria de
       * graficas y las pantallas de sesion, pacientes y finanzas — pantallas
       * que estan detras del login y que no vera nunca. En movil con datos eso
       * compite por el ancho de banda justo despues de cargar.
       *
       * Lo que se excluye NO deja de funcionar: se descarga cuando la ruta que
       * lo necesita se abre de verdad, y ahi el service worker ya lo cachea.
       * Solo deja de pagarlo por adelantado quien no lo usa.
       */
      workbox: {
        // Sin `webp`: las capturas de la landing son 701 KB y solo la primera
        // se ve sin desplazar. Las carga el navegador cuando tocan, con su
        // cache HTTP de siempre.
        globPatterns: ['**/*.{js,css,ico,svg,webmanifest}', 'logo.png'],
        globIgnores: [
          // Instrumentacion y graficas: nunca en el primer viewport.
          '**/sentry-*.js',
          '**/recharts-*.js',
          // Rutas privadas: solo existen tras iniciar sesion.
          '**/SessionPage-*.js',
          '**/PatientDetailsPage-*.js',
          '**/PatientsPage-*.js',
          '**/FinancePage-*.js',
          '**/AgendaPage-*.js',
          '**/DashboardPage-*.js',
          '**/DashboardLayout-*.js',
          '**/SettingsPage-*.js',
          '**/ClinicPage-*.js',
          '**/PlanPage-*.js',
          '**/AccessLogPage-*.js',
          '**/AddendumModal-*.js',
          // El HTML se sirve por red (ver navigateFallback abajo).
          'index.html',
          // 246 KB para un icono. Ya no lo referencia el HTML; que tampoco
          // viaje en el precache.
          'LogoFavi.png',
        ],
        // Borra los precaches de despliegues anteriores en vez de acumularlos.
        cleanupOutdatedCaches: true,
        /**
         * El documento se pide SIEMPRE a la red primero.
         *
         * El 17-09-2026 el service worker me sirvio un index.html de un
         * despliegue anterior mientras diagnosticaba por que la landing no
         * mejoraba: el servidor tenia la version nueva y el navegador la
         * vieja. Para una landing que recibe trafico de campanas, servir el
         * despliegue de ayer no es una optimizacion, es un error silencioso.
         *
         * Con tres segundos de espera y respaldo en cache, quien no tenga red
         * sigue abriendo la aplicacion; quien la tenga ve siempre lo ultimo.
         */
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }: { request: Request }) =>
              request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'kio-documentos',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
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
    modulePreload: {
      /**
       * Los graficos no se precargan.
       *
       * Vite marcaba `recharts` (365 KB de recharts + d3) como modulepreload
       * del entry, asi que todo el que abria la landing se descargaba la
       * libreria de graficas antes de ver nada — y las graficas solo existen
       * dentro de PatientDetailsPage y FinancePage, que son rutas lazy tras
       * login. Un visitante anonimo no vera una grafica jamas.
       *
       * Quitarlo del preload no lo rompe: cuando una de esas rutas se abre, su
       * import dinamico lo baja igual. Solo deja de pagarlo quien no lo usa.
       */
      resolveDependencies: (_url, deps) =>
        deps.filter((d) => !d.includes('recharts')),
    },
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
