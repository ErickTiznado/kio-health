import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-kio/5 dark:from-slate-950 dark:via-slate-950 dark:to-kio/10 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-kio to-kio/80 rounded-3xl mb-6 shadow-xl shadow-kio/20">
          <span className="text-4xl">🚀</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-kanji dark:text-white mb-3">
          Complete Your Profile
        </h1>
        <p className="text-text/60 dark:text-slate-400 mb-8">
          Welcome, <strong>{user?.email}</strong>! Before you can start using
          Kio Health, we need a few more details about your practice.
        </p>

        {/* Placeholder Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-cruz dark:border-slate-800 shadow-xl p-8 mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mx-auto mb-4">
            <span className="text-3xl">🛠️</span>
          </div>
          <h2 className="text-xl font-semibold text-kanji dark:text-white mb-2">
            Coming Soon
          </h2>
          <p className="text-text/60 dark:text-slate-400">
            The onboarding flow is under construction. This page will guide you
            through setting up your clinician profile, practice details, and
            preferences.
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="text-text/50 dark:text-slate-500 hover:text-kanji dark:hover:text-white text-sm font-medium transition-colors"
        >
          Logout and return to login
        </button>
      </div>
    </div>
  );
}
