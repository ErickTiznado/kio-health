import type { FC } from 'react';
import type { RiskFlagType } from '../../types/patients.types';
import { AlertCircle, AlertTriangle, ShieldAlert, HeartPulse } from 'lucide-react';

interface RiskFlagBadgeProps {
  flags: RiskFlagType[];
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const FLAG_CONFIG: Record<
  RiskFlagType,
  { label: string; colorClass: string; Icon: FC<{ className?: string; size?: number }> }
> = {
  SEVERE_DEPRESSION: {
    label: 'Depresión Severa',
    colorClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
    Icon: AlertCircle,
  },
  SEVERE_ANXIETY: {
    label: 'Ansiedad Severa',
    colorClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
    Icon: AlertCircle,
  },
  AUTOLESION: {
    label: 'Autolesión',
    colorClass: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
    Icon: AlertTriangle,
  },
  SUICIDAL_IDEATION: {
    label: 'Ideación Suicida',
    colorClass: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
    Icon: ShieldAlert,
  },
  URGENT: {
    label: 'Urgente',
    colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30',
    Icon: AlertCircle,
  },
  SUDDEN_DETERIORATION: {
    label: 'Deterioro Brusco',
    colorClass: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
    Icon: HeartPulse,
  },
};

export const RiskFlagBadge: FC<RiskFlagBadgeProps> = ({ flags, size = 'md', showLabel = true }) => {
  if (!flags || flags.length === 0) return null;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag) => {
        const config = FLAG_CONFIG[flag];
        if (!config) return null;
        const Icon = config.Icon;

        return (
          <div
            key={flag}
            className={`flex items-center font-bold border rounded-full ${config.colorClass} ${sizeClasses[size]}`}
            title={config.label}
          >
            <Icon size={iconSizes[size]} />
            {showLabel && <span>{config.label}</span>}
          </div>
        );
      })}
    </div>
  );
};
