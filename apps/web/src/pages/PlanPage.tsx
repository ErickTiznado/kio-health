import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { toast } from 'sonner';
import { ArrowLeft, Building2, CheckCircle2, Send, User } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useTrial } from '../hooks/use-trial';
import { capture } from '../lib/analytics';
import { useDocumentTitle } from '../hooks/use-document-title';

/**
 * Fin de la prueba: elegir cómo seguir.
 *
 * NO HAY TABLA DE PRECIOS, y no es un descuido. Los planes y tramos de Kio
 * están sin definir (`PRODUCT.md`), así que inventar importes aquí sería
 * publicar un precio que nadie ha decidido. Lo que se recoge es la modalidad y
 * la intención; el importe se acuerda hablando.
 *
 * EL FORMULARIO NO PASA POR LA API. Va directo a Sentry a propósito: en modo
 * `HARD` el `TrialGuard` rechaza todas las peticiones del usuario, así que un
 * POST a la API moriría con 403 y dejaría a la persona sin ninguna forma de
 * decir "quiero seguir". La única vía de salida no puede depender de la puerta
 * que está cerrada.
 */

type Track = 'INDIVIDUAL' | 'CLINIC';

const TRACKS: { key: Track; label: string; detail: string; icon: typeof User }[] = [
  {
    key: 'INDIVIDUAL',
    label: 'Práctica individual',
    detail: 'Trabajas solo: tu agenda, tus pacientes, tus cobros.',
    icon: User,
  },
  {
    key: 'CLINIC',
    label: 'Clínica o equipo',
    detail: 'Varios profesionales, pacientes y agenda compartidos por rol.',
    icon: Building2,
  },
];

export function PlanPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const trial = useTrial();
  useDocumentTitle('Elige tu plan');

  const [track, setTrack] = useState<Track | null>(null);
  const [note, setNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!track) return;

    setIsSending(true);
    try {
      capture('trial_plan_requested', {
        track,
        had_note: note.trim().length > 0,
        days_since_expiry:
          trial.endsAt === null
            ? null
            : Math.max(
                0,
                Math.floor((Date.now() - trial.endsAt.getTime()) / (24 * 60 * 60 * 1000)),
              ),
      });

      Sentry.captureMessage(`[plan] ${track} — ${user?.email ?? 'sin email'}`, {
        level: 'info',
        tags: { source: 'trial_plan_request', track },
        user: user ? { id: user.id, email: user.email } : undefined,
        extra: {
          note: note.trim() || '(sin nota)',
          trialEndsAt: trial.endsAt?.toISOString() ?? null,
        },
      });

      setSent(true);
      toast.success('Recibido. Te escribimos hoy mismo.');
    } catch {
      toast.error('No se pudo enviar. Inténtalo de nuevo en un momento.');
    } finally {
      setIsSending(false);
    }
  };

  const titulo = trial.isExpired ? 'Tu prueba terminó' : 'Elige cómo seguir';
  const subtitulo = trial.isExpired
    ? trial.isHardLocked
      ? 'Para volver a usar Kio, dinos cómo quieres continuar y lo cerramos contigo.'
      : 'Puedes seguir consultando tu información, pero no guardar cambios hasta que definamos tu plan.'
    : `Te quedan ${trial.daysRemaining} ${trial.daysRemaining === 1 ? 'día' : 'días'} de prueba. Puedes dejarlo cerrado ya.`;

  return (
    <div className="min-h-screen bg-bg px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Kio Health" className="mx-auto mb-4 h-20 w-20 object-contain" />
          <h1 className="text-2xl font-bold text-kanji-deep dark:text-white">{titulo}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-text-secondary">{subtitulo}</p>
        </div>

        {sent ? (
          <div role="status" className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm dark:border-emerald-500/20 dark:bg-slate-900">
            <CheckCircle2 size={40} className="mx-auto text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <p className="mt-4 text-base font-bold text-kanji-deep dark:text-white">Gracias, lo tenemos</p>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-text-secondary">
              Te escribimos a <strong className="text-text">{user?.email}</strong> para cerrar los detalles.
              Tu información sigue aquí, intacta.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <fieldset>
              <legend className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400">
                ¿Cómo trabajas?
              </legend>
              <div className="space-y-3">
                {TRACKS.map(({ key, label, detail, icon: Icon }) => {
                  const isSelected = track === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTrack(key)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors ${
                        isSelected
                          ? 'border-kio bg-kio-light/40 dark:bg-kio/10'
                          : 'border-gray-200 hover:border-kio/50 dark:border-slate-700'
                      }`}
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary dark:bg-slate-800">
                        <Icon size={20} className="text-kanji-deep dark:text-kio" aria-hidden="true" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-bold text-kanji-deep dark:text-white">{label}</span>
                        <span className="mt-0.5 block text-xs font-medium text-text-secondary">{detail}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label
              htmlFor="plan-note"
              className="mt-6 block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400"
            >
              Algo que debamos saber (opcional)
            </label>
            <textarea
              id="plan-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Cuántos profesionales sois, qué necesitas, dudas..."
              className="mt-1.5 block w-full resize-none rounded-xl border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-medium text-text shadow-sm transition-colors placeholder:font-normal placeholder:text-gray-400 focus:border-kio focus:bg-white focus:ring-2 focus:ring-kio/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-700"
            />

            <button
              type="submit"
              disabled={!track || isSending}
              className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kanji-deep px-4 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              <Send size={15} aria-hidden="true" />
              {isSending ? 'Enviando...' : 'Hablemos'}
            </button>

            <p className="mt-3 text-center text-xs font-medium text-text-secondary">
              Sin tarjeta y sin compromiso. Tu información no se borra.
            </p>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-4">
          {/* En modo solo lectura la app sigue siendo útil: volver tiene sentido.
              En bloqueo duro no hay a dónde volver, así que el enlace no se
              pinta en vez de llevar a una redirección circular. */}
          {!trial.isHardLocked && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-gray-600 transition-colors hover:text-kanji-deep dark:text-slate-400 dark:hover:text-kio"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Volver
            </button>
          )}
          {/* Ambos controles a gray-600 / slate-400: el token muted medía 2.31:1
              sobre lino, ilegible en un botón que hay que encontrar para actuar.
              La jerarquía entre los dos la sigue llevando el peso. */}
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-11 rounded-xl px-3 text-xs font-medium text-gray-600 transition-colors hover:text-text dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlanPage;
