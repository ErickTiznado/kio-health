import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { toast } from 'sonner';
import { MessageSquarePlus, X, Send, HelpCircle, Bug, Lightbulb, Heart } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { capture, currentRoute } from '../../lib/analytics';
import type { FeedbackSentiment } from '../../lib/analytics.events';

/**
 * Canal de feedback in-app para la beta cerrada.
 *
 * POR QUÉ FLOTANTE Y PERSISTENTE: el clínico trabaja en ráfagas de minutos
 * entre sesiones. Si para contarnos que algo no se entiende tiene que salir de
 * la app y escribir un correo, no nos lo cuenta — se calla y deja de volver.
 * El botón está donde está la fricción, en el momento en que se siente.
 *
 * DÓNDE VA CADA COSA (y por qué separadas):
 *
 *   · PostHog recibe `feedback_submitted` con sentimiento, ruta saneada y
 *     longitud. Sin el texto. Así se puede cruzar en agregado — "seis personas
 *     marcaron «confuso» en /session/:id" — sin meter prosa libre en un almacén
 *     de analítica.
 *   · Sentry recibe el mensaje completo, con el correo del clínico para poder
 *     responderle. Es la bandeja que hay que leer.
 *
 * El aviso de "no incluyas datos de pacientes" es parte del diseño, no un
 * adorno legal: el campo es texto libre y alguien escribirá un nombre si nadie
 * se lo advierte.
 */

interface SentimentOption {
  key: FeedbackSentiment;
  label: string;
  icon: typeof HelpCircle;
}

const SENTIMENTS: SentimentOption[] = [
  { key: 'confuso', label: 'No lo entiendo', icon: HelpCircle },
  { key: 'error', label: 'Algo falla', icon: Bug },
  { key: 'idea', label: 'Se me ocurre', icon: Lightbulb },
  { key: 'gusta', label: 'Esto me gusta', icon: Heart },
];

/** Rutas donde el widget no pinta nada: público, alta y portal del paciente. */
const HIDDEN_PREFIXES = ['/login', '/signup', '/forgot-password', '/reset-password', '/join', '/p'];

export function FeedbackWidget() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [sentiment, setSentiment] = useState<FeedbackSentiment | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cerrar con Escape y con clic fuera — mismo patrón que el menú "+ Nuevo".
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) textareaRef.current?.focus();
  }, [isOpen]);

  const isHidden =
    !isAuthenticated ||
    HIDDEN_PREFIXES.some(
      (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
    );

  if (isHidden) return null;

  const openPanel = () => {
    setIsOpen(true);
    capture('feedback_opened', { route: currentRoute() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = message.trim();
    if (!trimmed || !sentiment) return;

    setIsSending(true);
    const route = currentRoute();

    try {
      // Agregado, sin texto.
      capture('feedback_submitted', {
        sentiment,
        route,
        message_length: trimmed.length,
      });

      // Bandeja legible, con el texto y con a quién responder.
      Sentry.captureMessage(`[feedback] ${sentiment} — ${route}`, {
        level: 'info',
        tags: { source: 'feedback_widget', sentiment, route },
        user: user ? { id: user.id, email: user.email } : undefined,
        extra: {
          message: trimmed,
          route,
          plan: user?.profile?.plan ?? 'sin_perfil',
          clinic_role: user?.clinicRole ?? 'sin_clinica',
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        },
      });

      toast.success('Gracias. Lo leemos de verdad.');
      setMessage('');
      setSentiment(null);
      setIsOpen(false);
    } catch {
      toast.error('No se pudo enviar. Inténtalo de nuevo en un momento.');
    } finally {
      setIsSending(false);
    }
  };

  const canSubmit = Boolean(sentiment) && message.trim().length > 0 && !isSending;

  return (
    <>
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Enviar comentario sobre Kio"
          className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
        >
          <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800">
            <div>
              <p className="text-base font-bold text-kanji-deep dark:text-white">¿Cómo te va?</p>
              <p className="mt-0.5 text-xs font-medium text-text-secondary">
                Estamos en beta. Lo que nos digas cambia el producto.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar comentarios"
              className="-mr-2 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-secondary hover:text-kanji-deep dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-kio"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 py-4">
            <fieldset>
              <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-600 opacity-70 dark:text-slate-400">
                ¿De qué se trata?
              </legend>
              <div className="flex flex-wrap gap-2">
                {SENTIMENTS.map(({ key, label, icon: Icon }) => {
                  const isSelected = sentiment === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSentiment(key)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide transition-colors ${
                        isSelected
                          ? 'border-kio bg-kio-light text-kanji-deep dark:bg-kio/10 dark:text-kio'
                          : 'border-gray-200 bg-white text-text-secondary hover:border-kio/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Icon size={13} aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label
              htmlFor="feedback-message"
              className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-gray-600 opacity-70 dark:text-slate-400"
            >
              Cuéntanos
            </label>
            <textarea
              id="feedback-message"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Qué intentabas hacer y qué pasó..."
              className="mt-1.5 block w-full resize-none rounded-xl border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-medium text-kanji shadow-sm transition-colors placeholder:font-normal placeholder:text-gray-400 focus:border-kio focus:bg-white focus:ring-2 focus:ring-kio/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-700"
            />

            <p className="mt-2 text-xs font-medium text-text-muted">
              No incluyas nombres ni datos de tus pacientes.
            </p>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kanji-deep px-4 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              <Send size={15} aria-hidden="true" />
              {isSending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        aria-expanded={isOpen}
        aria-label="Enviar comentario sobre Kio"
        className="fixed bottom-4 right-4 z-50 flex min-h-11 items-center gap-2 rounded-xl bg-kanji-deep px-4 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95"
      >
        <MessageSquarePlus size={17} aria-hidden="true" />
        <span className="hidden sm:inline">Feedback</span>
      </button>
    </>
  );
}
