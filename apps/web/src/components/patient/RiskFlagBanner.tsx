import type { FC } from 'react';
import { useRiskFlags, useResolveRiskFlags } from '../../hooks/use-risk-flags';
import { RiskFlagBadge } from './RiskFlagBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface RiskFlagBannerProps {
  patientId: string;
}

export const RiskFlagBanner: FC<RiskFlagBannerProps> = ({ patientId }) => {
  const { data: riskFlagData } = useRiskFlags(patientId);
  const resolveMutation = useResolveRiskFlags();
  const [dismissed, setDismissed] = useState(false);

  const flags = riskFlagData?.flagTypes || [];
  const lastUpdated = riskFlagData?.lastUpdated;

  if (flags.length === 0 || dismissed) return null;

  const handleResolveAll = () => {
    resolveMutation.mutate({ patientId, flagTypesToResolve: flags });
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-900/30 p-4 relative">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 bg-red-100 dark:bg-red-500/20 p-2 rounded-full text-red-600 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-400 text-sm uppercase tracking-wider">
              Alertas de Riesgo Clínico
            </h3>
            {lastUpdated && (
              <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5 mb-2">
                Detectadas el {format(new Date(lastUpdated), "dd MMM yyyy, HH:mm", { locale: es })}
              </p>
            )}
            <RiskFlagBadge flags={flags} size="md" />
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={handleResolveAll}
            disabled={resolveMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            Marcar como Resuelto
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
            title="Ocultar temporalmente"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
