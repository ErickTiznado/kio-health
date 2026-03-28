import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './stores/auth.store';
import { useNoteStore } from './stores/notes.store';
import { Toaster } from 'sonner';
import { RequireAuth } from './components/RequireAuth';
import { PageTransition } from './components/ui/PageTransition';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Omnibox } from './components/ui/Omnibox';
import { TourOverlay } from './components/ui/TourOverlay';

// ── Static imports — auth + public pages needed on first render ───────────
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import InvitationAcceptPage from './pages/InvitationAcceptPage';
import NotFoundPage from './pages/NotFoundPage';

// ── Lazy imports — protected routes, loaded only when visited ─────────────
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const OnboardingPage = lazy(() =>
  import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);
const ChangePasswordPage = lazy(() =>
  import('./pages/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })),
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const AgendaPage = lazy(() =>
  import('./pages/AgendaPage').then((m) => ({ default: m.AgendaPage })),
);
const SessionPage = lazy(() =>
  import('./pages/SessionPage').then((m) => ({ default: m.SessionPage })),
);
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const PatientDetailsPage = lazy(() => import('./pages/PatientDetailsPage'));
const FinancePage = lazy(() => import('./pages/finance/FinancePage'));
const ClinicPage = lazy(() => import('./pages/ClinicPage'));

// ── Skeleton mostrado mientras el chunk lazy se descarga ──────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-slate-950">
      <div className="w-10 h-10 rounded-full border-4 border-kio/20 border-t-kio animate-spin" />
    </div>
  );
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (user?.profile) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/onboarding" replace />;
}

function App() {
  const location = useLocation();
  const syncOfflineNotes = useNoteStore((state) => state.syncOfflineNotes);
  const { isAuthenticated, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchCurrentUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleOnline = () => syncOfflineNotes();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncOfflineNotes]);

  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" richColors />
      <Omnibox />
      <TourOverlay />
      <Suspense fallback={<PageSkeleton />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* ── Públicas / Auth — estáticas ── */}
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
            <Route path="/join/:token" element={<PageTransition><InvitationAcceptPage /></PageTransition>} />

            {/* ── Protegidas — lazy ── */}
            <Route
              path="/change-password"
              element={<PageTransition><RequireAuth><ChangePasswordPage /></RequireAuth></PageTransition>}
            />
            <Route
              path="/dashboard"
              element={<PageTransition><RequireAuth><DashboardPage /></RequireAuth></PageTransition>}
            />
            <Route
              path="/agenda"
              element={<PageTransition><RequireAuth><AgendaPage /></RequireAuth></PageTransition>}
            />
            <Route
              path="/finance"
              element={<PageTransition><RequireAuth><FinancePage /></RequireAuth></PageTransition>}
            />
            <Route
              path="/session/:appointmentId"
              element={<PageTransition><RequireAuth><SessionPage /></RequireAuth></PageTransition>}
            />
            <Route
              path="/patients"
              element={<PageTransition><RequireAuth><PatientsPage /></RequireAuth></PageTransition>}
            />
            <Route
              path="/patients/:id"
              element={<PageTransition><RequireAuth><PatientDetailsPage /></RequireAuth></PageTransition>}
            />
            <Route
              path="/onboarding"
              element={<PageTransition><RequireAuth><OnboardingPage /></RequireAuth></PageTransition>}
            />
            <Route
              path="/settings"
              element={<PageTransition><RequireAuth><SettingsPage /></RequireAuth></PageTransition>}
            />
            <Route
              path="/clinic"
              element={<PageTransition><RequireAuth><ClinicPage /></RequireAuth></PageTransition>}
            />

            {/* ── Raíz y 404 ── */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
