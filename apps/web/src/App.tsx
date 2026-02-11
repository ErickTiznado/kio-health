import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SettingsPage } from './pages/SettingsPage';
import { AgendaPage } from './pages/AgendaPage';
import { SessionPage } from './pages/SessionPage';

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Switch logic: profile exists → dashboard, no profile → onboarding
  if (user?.profile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/onboarding" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/agenda"
        element={
          <RequireAuth>
            <AgendaPage />
          </RequireAuth>
        }
      />
      <Route
        path="/session/:appointmentId"
        element={
          <RequireAuth>
            <SessionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />

      {/* Root Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Catch-all - redirect to root for Switch logic */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

