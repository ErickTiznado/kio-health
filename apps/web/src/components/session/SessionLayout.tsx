import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, LogOut, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

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
  onStartSession?: () => void;
  onFinishSession?: () => void;
  onNoShow?: () => void;
}

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
  onStartSession,
  onFinishSession,
  onNoShow,
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => navigate('/agenda');

  return (
    <div className="h-screen overflow-hidden bg-bg flex flex-col">
      {/* ── Minimal Header ── */}
      <header className="h-16 bg-surface/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        {/* Left — Back + Patient Info */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleGoBack}
            className="p-2 -ml-2 rounded-full hover:bg-secondary text-text-secondary transition-colors"
            aria-label="Volver a la agenda"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-text leading-tight">
              {patientName} <span className="text-text-muted font-normal">#{sessionNumber || 1}</span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              {patientAge !== undefined && <span>{patientAge} años</span>}
              <span>
                Última vez: {lastVisit ? format(new Date(lastVisit), 'dd MMM') : 'N/A'}
              </span>
              <a
                href={`/patients/${patientId}`}
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-kanji dark:text-kio hover:text-kanji/80 dark:hover:text-kio/80 hover:underline cursor-pointer transition-colors"
              >
                Ver Historial Completo
              </a>
            </div>
          </div>
        </div>

        {/* Center — Session Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
          isOvertime 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' 
            : 'bg-secondary border-border text-text-secondary'
        }`}>
          <Clock size={16} className={isOvertime ? 'animate-pulse' : 'text-text-muted'} />
          <span className="text-sm font-mono font-medium tracking-wider">
            {elapsedTime}
          </span>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          {status === 'SCHEDULED' && (
            <>
              <button
                onClick={onNoShow}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-red-600 dark:hover:text-red-400 transition-colors bg-surface border border-border rounded-md"
              >
                No Asistió
              </button>
              <button
                onClick={onStartSession}
                className="flex items-center gap-2 bg-kanji dark:bg-kio text-white dark:text-slate-900 text-sm font-bold px-5 py-2 rounded-full hover:bg-kanji/90 dark:hover:bg-kio/80 transition-all shadow-md hover:shadow-lg"
              >
                <CheckCircle size={16} />
                Iniciar Sesión
              </button>
            </>
          )}

          {status === 'IN_PROGRESS' && (
            <button
              onClick={onFinishSession}
              className="flex items-center gap-2 bg-green-600 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
            >
              <LogOut size={16} />
              Finalizar Sesión
            </button>
          )}

          {status === 'COMPLETED' && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
              Completada
            </span>
          )}
        </div>
      </header>

      {/* ── Main Area ── */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
