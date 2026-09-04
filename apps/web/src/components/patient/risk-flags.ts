import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  AlertTriangle,
  Activity,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
} from 'lucide-react';
import type { RiskFlagType } from '../../types/patients.types';

/**
 * Vocabulario de las banderas de riesgo: rango, nombre, icono y orden.
 *
 * Vive fuera de `RiskFlagBadge.tsx` porque un módulo que exporta un componente
 * y además constantes rompe el refresco en caliente de Vite —y con él la regla
 * `react-refresh/only-export-components`, que es un error de lint, no un aviso—.
 * El distintivo y la franja del expediente leen los dos de aquí.
 */

/**
 * Rango de severidad explícito de una bandera de riesgo.
 *
 * Antes la severidad vivía sólo en el tono y el orden estaba invertido:
 * ansiedad y depresión severas iban en rojo, ideación suicida y autolesión en
 * naranja, y el deterioro brusco en azul (un color que no existe en el
 * sistema). Un clínico escaneando el listado lee rojo como «lo más urgente» y
 * triaba ansiedad severa por encima de ideación suicida.
 *
 * El rango es ahora un dato: ordena, se imprime como texto dentro de la propia
 * etiqueta y el color sólo lo acompaña.
 */
export type RiskSeverity = 'CRITICO' | 'ALTO' | 'MEDIO';

/** Mayor número = más urgente. Se usa para ordenar, no se muestra. */
const SEVERITY_WEIGHT: Record<RiskSeverity, number> = {
  CRITICO: 3,
  ALTO: 2,
  MEDIO: 1,
};

export const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  CRITICO: 'Crítico',
  ALTO: 'Alto',
  MEDIO: 'Medio',
};

export interface RiskFlagMeta {
  label: string;
  severity: RiskSeverity;
  Icon: LucideIcon;
}

// Un icono distinto por tipo: antes tres banderas compartían `AlertCircle` y el
// icono no distinguía nada.
const FLAG_CONFIG: Record<RiskFlagType, RiskFlagMeta> = {
  SUICIDAL_IDEATION: {
    label: 'Ideación suicida',
    severity: 'CRITICO',
    Icon: ShieldAlert,
  },
  AUTOLESION: {
    label: 'Autolesión',
    severity: 'CRITICO',
    Icon: AlertTriangle,
  },
  URGENT: {
    label: 'Urgente',
    severity: 'ALTO',
    Icon: AlertCircle,
  },
  SEVERE_DEPRESSION: {
    label: 'Depresión severa',
    severity: 'ALTO',
    Icon: TrendingDown,
  },
  SEVERE_ANXIETY: {
    label: 'Ansiedad severa',
    severity: 'ALTO',
    Icon: Activity,
  },
  SUDDEN_DETERIORATION: {
    label: 'Deterioro brusco',
    severity: 'MEDIO',
    Icon: HeartPulse,
  },
};

const FALLBACK: RiskFlagMeta = {
  // Una bandera que el front no conoce todavía no puede degradarse a «nada»:
  // se muestra con su código y en el rango más alto hasta que se le dé uno.
  label: 'Bandera sin clasificar',
  severity: 'CRITICO',
  Icon: AlertTriangle,
};

export const getRiskFlagMeta = (flag: RiskFlagType): RiskFlagMeta =>
  FLAG_CONFIG[flag] ?? FALLBACK;

/** Banderas de más urgente a menos, sin mutar el array de entrada. */
export const sortRiskFlags = (flags: RiskFlagType[]): RiskFlagType[] =>
  [...flags].sort(
    (a, b) =>
      SEVERITY_WEIGHT[getRiskFlagMeta(b).severity] -
      SEVERITY_WEIGHT[getRiskFlagMeta(a).severity],
  );

/** Rango más alto presente en el conjunto. `null` si no hay banderas. */
export const highestSeverity = (flags: RiskFlagType[]): RiskSeverity | null => {
  if (!flags || flags.length === 0) return null;
  return flags.reduce<RiskSeverity>((worst, flag) => {
    const s = getRiskFlagMeta(flag).severity;
    return SEVERITY_WEIGHT[s] > SEVERITY_WEIGHT[worst] ? s : worst;
  }, 'MEDIO');
};
