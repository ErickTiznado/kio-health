import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import * as Sentry from '@sentry/react'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App'
import './lib/i18n'
import './index.css'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,          // reducido de 1.0 → 10% de transacciones
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

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
