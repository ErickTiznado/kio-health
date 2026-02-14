import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <h2 className="text-2xl font-bold text-kanji">
              Algo salió mal
            </h2>
            <p className="text-gray-500 text-sm max-w-sm">
              Ocurrió un error inesperado. Intenta recargar la página.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-kio text-white px-6 py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
