import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './stores/auth.store';
import { useNoteStore } from './stores/notes.store';
import { Toaster } from 'sonner';
import { RequireAuth } from './components/RequireAuth';
import { PageTransition } from './components/ui/PageTransition';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { SettingsPage } from './pages/SettingsPage';
import { AgendaPage } from './pages/AgendaPage';
import { SessionPage } from './pages/SessionPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailsPage from './pages/PatientDetailsPage';
import FinancePage from './pages/finance/FinancePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';
import ClinicPage from './pages/ClinicPage';
import InvitationAcceptPage from './pages/InvitationAcceptPage';

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (user?.profile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/onboarding" replace />;
}

import { Omnibox } from './components/ui/Omnibox';
import { TourOverlay } from './components/ui/TourOverlay';

function App() {
  const location = useLocation();
  const syncOfflineNotes = useNoteStore((state) => state.syncOfflineNotes);

  useEffect(() => {
    const handleOnline = () => {
      syncOfflineNotes();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncOfflineNotes]);

  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" richColors />
      <Omnibox />
      <TourOverlay />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            }
          />
          <Route
            path="/signup"
            element={
              <PageTransition>
                <SignupPage />
              </PageTransition>
            }
          />

          {/* Force password change — protected but no sidebar */}
          <Route
            path="/change-password"
            element={
              <PageTransition>
                <RequireAuth>
                  <ChangePasswordPage />
                </RequireAuth>
              </PageTransition>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              </PageTransition>
            }
          />
          <Route
            path="/agenda"
            element={
              <PageTransition>
                <RequireAuth>
                  <AgendaPage />
                </RequireAuth>
              </PageTransition>
            }
          />
          <Route
            path="/finance"
            element={
              <PageTransition>
                <RequireAuth>
                  <FinancePage />
                </RequireAuth>
              </PageTransition>
            }
          />
          <Route
            path="/session/:appointmentId"
            element={
              <PageTransition>
                <RequireAuth>
                  <SessionPage />
                </RequireAuth>
              </PageTransition>
            }
          />
          <Route
            path="/patients"
            element={
              <PageTransition>
                <RequireAuth>
                  <PatientsPage />
                </RequireAuth>
              </PageTransition>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <PageTransition>
                <RequireAuth>
                  <PatientDetailsPage />
                </RequireAuth>
              </PageTransition>
            }
          />
          <Route
            path="/onboarding"
            element={
              <PageTransition>
                <RequireAuth>
                  <OnboardingPage />
                </RequireAuth>
              </PageTransition>
            }
          />
          <Route
            path="/settings"
            element={
              <PageTransition>
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              </PageTransition>
            }
          />
          <Route
            path="/clinic"
            element={
              <PageTransition>
                <RequireAuth>
                  <ClinicPage />
                </RequireAuth>
              </PageTransition>
            }
          />
          {/* Public route — InvitationAcceptPage handles auth redirect internally */}
          <Route
            path="/join/:token"
            element={
              <PageTransition>
                <InvitationAcceptPage />
              </PageTransition>
            }
          />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Catch-all - 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
