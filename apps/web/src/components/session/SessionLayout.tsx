import type { FC, ReactNode } from 'react';
import { ChevronLeft, Clock, LogOut, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SessionLayoutProps {
  children: ReactNode;
  patientId: string;
  patientName: string;
  patientAge?: number;
  sessionNumber?: number;
  elapsedTime: string;
  isOvertime?: boolean;
  lastVisit: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  /** El arranque de la sesión está en vuelo: el botón no admite un segundo clic. */
  isStarting?: boolean;
  onStartSession?: () => void;
  onFinishSession?: () => void;
  onNoShow?: () => void;
  /** La página decide si se puede salir (p. ej. cambios sin guardar). */
  onLeave: () => void;
}

/** Estados terminales: la cabecera ya no ofrece acción, solo informa. */
const TERMINAL_STATUS: Record<string, { label: string; className: string }> = {
  COMPLETED: {
    label: 'Completada',
    className:
      'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  },
  CANCELLED: {
    label: 'Cancelada',
    className:
      'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
  },
  NO_SHOW: {
    label: 'No asistió',
    className:
      'text-text-secondary bg-secondary border-border',
  },
};

export const SessionLayout: FC<SessionLayoutProps> = ({
  children,
  patientId,
  patientName,
  patientAge,
  sessionNumber,
  elapsedTime,
  isOvertime,
  lastVisit,
  status,
  isStarting = false,
  onStartSession,
  onFinishSession,
  onNoShow,
  onLeave,
}) => {
  const terminal = TERMINAL_STATUS[status];

  return (
    <div className="h-screen overflow-hidden bg-bg flex flex-col">
      {/* ── Cabecera ── */}
      <header className="shrink-0 bg-surface border-b border-border">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:flex-nowrap sm:min-h-16 sm:px-6">
          {/* Izquierda — Volver + paciente */}
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:flex-1">
            <button
              type="button"
              onClick={onLeave}
              className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-secondary hover:text-text"
              aria-label="Volver a la agenda"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>

            <div className="flex min-w-0 flex-col">
              <h1 className="truncate text-base font-bold leading-tight text-text sm:text-lg">
                {patientName}{' '}
                <span className="font-normal text-text-muted">#{sessionNumber ?? 1}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 text-xs text-text-secondary">
                {patientAge !== undefined && <span>{patientAge} años</span>}
                <span>
                  Última vez:{' '}
                  {lastVisit ? format(new Date(lastVisit), 'd MMM', { locale: es }) : 'N/A'}
                </span>
                <a
                  href={`/patients/${patientId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-kanji-deep transition-colors hover:underline dark:text-kio"
                >
                  Ver historial completo
                </a>
              </div>
            </div>
          </div>

          {/* Centro — Cronómetro de sesión */}
          <div
            role="timer"
            aria-label={
              isOvertime
                ? `Tiempo de sesión ${elapsedTime}, excedido`
                : `Tiempo de sesión ${elapsedTime}`
            }
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
              isOvertime
                ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
                : 'border-border bg-secondary text-text-secondary'
            }`}
          >
            <Clock
              size={16}
              aria-hidden="true"
              className={isOvertime ? 'animate-pulse motion-reduce:animate-none' : 'text-text-muted'}
            />
            <span className="font-mono text-sm font-medium tracking-wider tabular-nums">
              {elapsedTime}
            </span>
            {isOvertime && (
              <span className="text-[11px] font-bold uppercase tracking-wider">Excedido</span>
            )}
          </div>

          {/* Derecha — Acciones */}
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0 sm:flex-1 sm:justify-end">
            {status === 'SCHEDULED' && (
              <>
                <button
                  type="button"
                  onClick={onNoShow}
                  className="flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium text-text-secondary transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                >
                  No asistió
                </button>
                <button
                  type="button"
                  onClick={onStartSession}
                  disabled={isStarting}
                  className="flex min-h-11 items-center gap-2 rounded-xl bg-kanji-deep px-5 text-sm font-bold text-white transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStarting ? (
                    <Loader2
                      size={16}
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                    />
                  ) : (
                    <CheckCircle size={16} aria-hidden="true" />
                  )}
                  {isStarting ? 'Iniciando…' : 'Iniciar sesión'}
                </button>
              </>
            )}

            {status === 'IN_PROGRESS' && (
              <button
                type="button"
                onClick={onFinishSession}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition-all duration-150 hover:bg-emerald-700 active:scale-95"
              >
                <LogOut size={16} aria-hidden="true" />
                Finalizar sesión
              </button>
            )}

            {terminal && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${terminal.className}`}
              >
                {terminal.label}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Área principal ── */}
      <main className="relative min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
};
