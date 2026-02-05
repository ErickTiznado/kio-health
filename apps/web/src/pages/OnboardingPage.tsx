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
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-kio/5 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-kio to-kio/80 rounded-3xl mb-6 shadow-xl shadow-kio/20">
          <span className="text-4xl">🚀</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-kanji mb-3">
          Complete Your Profile
        </h1>
        <p className="text-text/60 mb-8">
          Welcome, <strong>{user?.email}</strong>! Before you can start using
          Kio Health, we need a few more details about your practice.
        </p>

        {/* Placeholder Card */}
        <div className="bg-white rounded-3xl border border-cruz shadow-xl p-8 mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mx-auto mb-4">
            <span className="text-3xl">🛠️</span>
          </div>
          <h2 className="text-xl font-semibold text-kanji mb-2">
            Coming Soon
          </h2>
          <p className="text-text/60">
            The onboarding flow is under construction. This page will guide you
            through setting up your clinician profile, practice details, and
            preferences.
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="text-text/50 hover:text-kanji text-sm font-medium transition-colors"
        >
          Logout and return to login
        </button>
      </div>
    </div>
  );
}
