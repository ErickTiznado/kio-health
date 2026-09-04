import type { FC } from 'react';
import type { RiskFlagType } from '../../types/patients.types';
import { getRiskFlagMeta, sortRiskFlags, SEVERITY_LABEL, type RiskSeverity } from './risk-flags';

// La paleta se colapsa a los semánticos del sistema (rose para peligro, amber
// para aviso, neutro slate para el resto). El emerald queda deliberadamente
// fuera: verde dentro de una bandera de riesgo se lee como «sin riesgo», que es
// justo la inversión que este componente venía a corregir.
const SEVERITY_STYLE: Record<RiskSeverity, string> = {
  CRITICO:
    'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/40',
  ALTO: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/40',
  MEDIO:
    'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
};

/**
 * No hay variante que oculte el nombre de la bandera.
 *
 * Existió un `showLabel={false}` que dejaba visible sólo el rango («ALTO») y
 * mandaba el nombre a texto sr-only: dos banderas del mismo rango se pintaban
 * como dos distintivos idénticos salvo por el icono, que es exactamente el
 * problema —el dato clínico viviendo sólo en un pictograma— que este
 * componente venía a corregir. Ningún consumidor la usaba ya, así que se
 * retira en vez de documentarse. `size` sigue cubriendo la necesidad real:
 * caber en una fila o en un panel estrecho.
 */
interface RiskFlagBadgeProps {
  flags: RiskFlagType[];
  size?: 'sm' | 'md' | 'lg';
}

// Suelo tipográfico de 11px también en `sm`, que es el tamaño que usa cada fila
// del listado de pacientes: antes bajaba a 10px.
const SIZE_CLASSES: Record<NonNullable<RiskFlagBadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

const ICON_SIZES: Record<NonNullable<RiskFlagBadgeProps['size']>, number> = {
  sm: 14,
  md: 15,
  lg: 17,
};

export const RiskFlagBadge: FC<RiskFlagBadgeProps> = ({ flags, size = 'md' }) => {
  if (!flags || flags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {sortRiskFlags(flags).map((flag) => {
        const { label, severity, Icon } = getRiskFlagMeta(flag);

        return (
          <span
            key={flag}
            className={`inline-flex items-center rounded-full border font-bold ${SEVERITY_STYLE[severity]} ${SIZE_CLASSES[size]}`}
          >
            <Icon size={ICON_SIZES[size]} aria-hidden="true" />
            {/* El nombre de la bandera se pinta siempre: el icono acompaña,
                nunca sustituye. */}
            <span>{label}</span>
            <span aria-hidden="true" className="opacity-50">
              ·
            </span>
            {/* El rango va como texto, no como tono: en táctil, en escala de
                grises y con lector de pantalla el color no existe. */}
            <span className="uppercase tracking-wider">{SEVERITY_LABEL[severity]}</span>
          </span>
        );
      })}
    </div>
  );
};
