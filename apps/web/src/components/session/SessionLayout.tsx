import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, LogOut } from 'lucide-react';

interface SessionLayoutProps {
  children: ReactNode;
  patientName: string;
  patientAge: number;
  elapsedTime: string;
  /** Called when the clinician clicks "Finalizar Consulta". */
  onFinishSession: () => void;
}

/**
 * Minimal layout for clinical sessions — Deep Work mode.
 * No sidebar. Slim header with back navigation, timer, and finish CTA.
 */
export const SessionLayout: FC<SessionLayoutProps> = ({
  children,
  patientName,
  patientAge,
  elapsedTime,
  onFinishSession,
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => navigate('/agenda');

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* ── Minimal Header ── */}
      <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-5 sticky top-0 z-30">
        {/* Left — Back + Patient */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100/70 text-gray-400 hover:text-kanji transition-colors cursor-pointer"
            aria-label="Volver a la agenda"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-kanji tracking-tight">
              {patientName}
            </span>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {patientAge} años
            </span>
          </div>
        </div>

        {/* Center — Session Timer */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Clock size={14} className="text-gray-300" />
          <span className="text-sm font-mono font-medium text-gray-400 tracking-wider">
            {elapsedTime}
          </span>
        </div>

        {/* Right — Finish CTA */}
        <button
          type="button"
          onClick={onFinishSession}
          className="flex items-center gap-2 bg-kanji text-white text-sm font-bold px-5 py-2.5 rounded-2xl hover:bg-kanji/90 hover:shadow-lg hover:shadow-kanji/25 active:scale-[0.97] transition-all duration-200 cursor-pointer"
        >
          <LogOut size={15} />
          Finalizar Consulta
        </button>
      </header>

      {/* ── Main Area — full remaining height ── */}
      <main className="flex-1 h-[calc(100vh-64px)]">{children}</main>
    </div>
  );
};
