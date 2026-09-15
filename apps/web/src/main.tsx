import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initAnalytics } from './lib/analytics'
import App from './App'
import './lib/i18n'
import './index.css'

/**
 * Sentry se carga DESPUES del primer pintado, no antes.
 *
 * Con `import` estatico eran 252 KB —el segundo chunk mas grande de la app, y
 * Session Replay es la mayor parte— descargados y ejecutados antes de que el
 * visitante viera un solo pixel. En una landing que recibe trafico de anuncios
 * en el navegador de Instagram, eso es cobrarle la instrumentacion a la persona
 * que todavia no sabe si le interesas.
 *
 * El intercambio es explicito: se pierden los errores del primer instante de
 * arranque. Es asumible porque `ErrorBoundary` sigue atrapando el fallo y
 * mostrando la pantalla de error — solo se retrasa el reporte, no la captura.
 */
function initSentryDiferido() {
  const dsn = import.meta.env.VITE_SENTRY_DSN || '';
  if (!dsn) return;

  const arrancar = () =>
    void import('@sentry/react').then((Sentry) => {
      Sentry.init({
        dsn,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
        tracesSampleRate: 0.1,          // reducido de 1.0 → 10% de transacciones
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    });

  // `requestIdleCallback` espera a que el hilo principal este libre; sin el
  // (Safari), un respiro fijo cumple el mismo papel.
  const idle = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void;
    }
  ).requestIdleCallback;

  if (idle) idle(arrancar, { timeout: 5000 });
  else window.setTimeout(arrancar, 2000);
}

// Sentry dice qué se rompe; esto dice qué se usa. Sin clave es un no-op, así
// que en local no manda nada y los eventos salen por consola.
initAnalytics();
initSentryDiferido();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,      // 2 min — evita refetch en cada mount
      gcTime: 10 * 60 * 1000,         // 10 min — mantiene cache en memoria
      retry: 1,                        // default era 3 — menos ruido en errores reales
      refetchOnWindowFocus: false,     // evita rafaga de requests al cambiar de pestaña
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {/* reducedMotion:"user" respeta la preferencia del OS para animaciones */}
          <MotionConfig reducedMotion="user">
            <App />
          </MotionConfig>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
