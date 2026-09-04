import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import * as Sentry from '@sentry/react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    Sentry.captureException(error, { extra: { errorInfo } });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg dark:bg-slate-950 flex items-center justify-center p-4">
          <div
            role="alert"
            // Card en reposo: `shadow-sm`. No está despegada del plano, solo
            // centrada en una página vacía.
            className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-200 dark:border-slate-800"
          >
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600 dark:text-rose-400">
              <AlertTriangle aria-hidden="true" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Algo salió mal</h1>
            <p className="text-gray-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              <br />
              Si el problema persiste, contacta a soporte.
            </p>
            <button
              onClick={() => window.location.reload()}
              // `bg-kanji` sobre texto blanco mide 3.9:1 — por debajo de AA para
              // texto normal. `kanji-deep` da 7.3:1.
              className="w-full min-h-11 bg-kanji-deep hover:bg-kanji-deep/90 text-white font-bold py-4 rounded-xl shadow-md shadow-kanji-deep/20 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCcw aria-hidden="true" size={20} />
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
