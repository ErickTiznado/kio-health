import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useAcceptInvitation } from '../hooks/use-clinics';
import { validateToken } from '../lib/clinics.api';
import { Building2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function InvitationAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const [clinicName, setClinicName] = useState<string | null>(null);
  const [invitedRole, setInvitedRole] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const acceptMutation = useAcceptInvitation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }

    if (!token) {
      setTimeout(() => {
        setError('Token de invitación no válido');
        setValidating(false);
      }, 0);
      return;
    }

    validateToken(token)
      .then((data) => {
        setClinicName(data.clinicName);
        setInvitedRole(data.invitedRole);
        setValidating(false);
      })
      .catch(() => {
        setError('Esta invitación no es válida o ya expiró');
        setValidating(false);
      });
  }, [token, isAuthenticated, navigate, location.pathname]);

  const handleAccept = async () => {
    if (!token) return;
    await acceptMutation.mutateAsync(token);
    navigate('/dashboard', { replace: true });
  };

  const roleLabel =
    invitedRole === 'OWNER'
      ? 'Propietario'
      : invitedRole === 'ADMIN'
        ? 'Administrador'
        : 'Miembro';

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-kio/10 dark:bg-kio/20 rounded-2xl flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-kio" />
          </div>

          {validating ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-kio mb-4" />
              <p className="text-text/60 dark:text-slate-400">Validando invitación...</p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
              <h1 className="text-xl font-bold text-kanji dark:text-white mb-2">
                Invitación no válida
              </h1>
              <p className="text-text/60 dark:text-slate-400 text-sm">{error}</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-kanji dark:text-white mb-2">
                Invitación a clínica
              </h1>
              <p className="text-text/60 dark:text-slate-400 text-sm mb-6">
                Has sido invitado a unirte a{' '}
                <span className="font-semibold text-kio">{clinicName}</span> como{' '}
                <span className="font-medium text-kanji dark:text-white">{roleLabel}</span>.
              </p>

              {acceptMutation.isSuccess ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={20} />
                  <span className="font-medium">¡Te has unido exitosamente!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={acceptMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-kio text-white font-medium rounded-xl hover:bg-kio/90 transition-colors disabled:opacity-70"
                >
                  {acceptMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Building2 size={18} />
                  )}
                  Aceptar invitación
                </button>
              )}

              {acceptMutation.isError && (
                <p className="mt-4 text-sm text-red-500">
                  Error al aceptar la invitación. Es posible que ya pertenezcas a una clínica.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
