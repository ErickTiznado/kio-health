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
  totalBalance: number;
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
  totalBalance,
  lastVisit,
  status,
  onStartSession,
  onFinishSession,
  onNoShow,
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => navigate('/agenda');

  return (
    <div className="min-h-screen bg-bg dark:bg-slate-950 flex flex-col">
      {/* ── Minimal Header ── */}
      <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        {/* Left — Back + Patient Info */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleGoBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
            aria-label="Volver a la agenda"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {patientName} <span className="text-gray-400 dark:text-slate-500 font-normal">#{sessionNumber || 1}</span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
              {patientAge !== undefined && <span>{patientAge} años</span>}
              <span className={`font-semibold ${totalBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                Saldo: ${totalBalance.toFixed(2)}
              </span>
              <span>
                Última vez: {lastVisit ? format(new Date(lastVisit), 'dd MMM') : 'N/A'}
              </span>
              <a
                href={`/patients/${patientId}`}
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-indigo-600 dark:text-kio hover:text-indigo-800 dark:hover:text-kio/80 hover:underline cursor-pointer"
              >
                Ver Historial Completo
              </a>
            </div>
          </div>
        </div>

        {/* Center — Session Timer */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700">
          <Clock size={16} className="text-gray-400 dark:text-slate-500" />
          <span className="text-sm font-mono font-medium text-gray-600 dark:text-slate-300 tracking-wider">
            {elapsedTime}
          </span>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          {status === 'SCHEDULED' && (
            <>
              <button
                onClick={onNoShow}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md"
              >
                No Asistió
              </button>
              <button
                onClick={onStartSession}
                className="flex items-center gap-2 bg-indigo-600 dark:bg-kio text-white dark:text-slate-900 text-sm font-bold px-5 py-2 rounded-full hover:bg-indigo-700 dark:hover:bg-kio/80 transition-all shadow-md hover:shadow-lg"
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
