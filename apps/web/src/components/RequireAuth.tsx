import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { SessionTimeout } from './auth/SessionTimeout';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-kio border-t-transparent rounded-full animate-spin" />
          <p className="text-text/60">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <SessionTimeout />
      {children}
    </>
  );
}
