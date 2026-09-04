import { useState, type FC } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { useRiskFlags, useResolveRiskFlags } from '../../hooks/use-risk-flags';
import type { RiskFlagType } from '../../types/patients.types';
import { confirmAction } from '../../lib/confirm-action';
import { WidgetError } from '../widgets/WidgetError';
import { RiskFlagBadge } from './RiskFlagBadge';
import {
  SEVERITY_LABEL,
  getRiskFlagMeta,
  highestSeverity,
  sortRiskFlags,
} from './risk-flags';

interface RiskFlagBannerProps {
  patientId: string;
}

/**
 * Preferencia de despliegue del aviso, compartida por todos los expedientes.
 *
 * El aviso es lo primero que se ve al abrir una ficha, a distancia de lectura
 * de un paciente sentado enfrente. Plegado sigue afirmando que hay riesgo
 * activo y de qué rango — no oculta el hecho, sólo los nombres de las
 * banderas. El clínico que trabaja solo lo despliega una vez y se queda así.
 */
const STORAGE_KEY = 'kio:risk-banner-expanded';

const readExpandedPref = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    // Modo privado del navegador o almacenamiento bloqueado: se asume plegado.
    return false;
  }
};

const writeExpandedPref = (expanded: boolean) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, expanded ? '1' : '0');
  } catch {
    // No hay dónde guardarlo; la sesión actual sigue funcionando igual.
  }
};

const STRIP =
  'border-b border-rose-200 bg-rose-50 px-4 py-2.5 dark:border-rose-900/40 dark:bg-rose-950/30 sm:px-6 md:px-8';

export const RiskFlagBanner: FC<RiskFlagBannerProps> = ({ patientId }) => {
  const { data: riskFlagData, isLoading, isError, refetch } = useRiskFlags(patientId);
  const resolveMutation = useResolveRiskFlags();
  const [isExpanded, setIsExpanded] = useState(readExpandedPref);

  const flags = sortRiskFlags(riskFlagData?.flagTypes ?? []);
  const lastUpdated = riskFlagData?.lastUpdated;
  const worst = highestSeverity(flags);

  // El error va ANTES que el vacío, y aquí más que en ninguna otra superficie:
  // no pintar nada tras un 500 equivale a afirmar "este paciente no tiene
  // banderas de riesgo" sin saberlo.
  if (isError) {
    return (
      <div className="border-b border-border px-4 py-3 dark:border-slate-800 sm:px-6 md:px-8">
        <WidgetError
          what="las banderas de riesgo de este paciente"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Mientras no se sabe, se dice que no se sabe: callar equivaldría a afirmar
  // que no hay banderas antes de haberlo comprobado.
  //
  // La franja existe SÓLO mientras la petición está en vuelo, y al resolverse
  // pasa una de dos cosas: si hay banderas la sustituye el aviso plegado, que
  // mide lo mismo y no mueve nada; si no las hay —el caso mayoritario— la
  // franja desaparece entera y la cabecera sube su alto de golpe. Ese salto es
  // real y no está compensado: se acepta porque la alternativa es reservar un
  // hueco permanente en la parte más cara del expediente para un aviso que casi
  // nunca aparece.
  if (isLoading) {
    return (
      <div
        aria-busy="true"
        className="border-b border-border bg-secondary px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900 sm:px-6 md:px-8"
      >
        <p className="flex min-h-11 items-center text-xs font-medium text-slate-600 dark:text-slate-400">
          Comprobando banderas de riesgo…
        </p>
      </div>
    );
  }

  if (flags.length === 0 || !worst) return null;

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    writeExpandedPref(next);
  };

  const handleResolve = async (targets: RiskFlagType[]) => {
    const names = targets.map((flag) => getRiskFlagMeta(flag).label).join(', ');
    const isSingle = targets.length === 1;

    // Resolver una bandera es el control más consecuente del producto y hasta
    // ahora era el que menos fricción tenía: un clic sin confirmar limpiaba
    // TODAS las banderas activas, incluida la ideación suicida, mientras que
    // archivar un paciente —reversible— sí pedía confirmación.
    const confirmed = await confirmAction({
      title: isSingle
        ? '¿Marcar la bandera como resuelta?'
        : `¿Marcar ${targets.length} banderas como resueltas?`,
      description: `Se retirará del expediente: ${names}. Dejará de avisar al abrir la ficha. No borra las notas ni el historial clínico.`,
      confirmLabel: isSingle ? 'Sí, resolver' : `Sí, resolver ${targets.length}`,
      cancelLabel: 'Cancelar',
      variant: 'danger',
    });

    if (confirmed) {
      resolveMutation.mutate({ patientId, flagTypesToResolve: targets });
    }
  };

  const countLabel =
    flags.length === 1 ? '1 bandera activa' : `${flags.length} banderas activas`;

  return (
    <div className={STRIP}>
      <div className="mx-auto max-w-6xl">
        {/* Franja siempre visible: afirma el hecho y su rango, sin nombrar las
            banderas. No hay "descartar" — una bandera activa no es una
            notificación que se cierra. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="flex min-h-11 items-center gap-2.5 text-sm font-bold text-rose-900 dark:text-rose-200">
            <ShieldAlert size={18} aria-hidden="true" className="shrink-0" />
            Riesgo clínico activo
            <span className="font-medium text-rose-800 dark:text-rose-300">
              · {countLabel} · nivel {SEVERITY_LABEL[worst].toLowerCase()}
            </span>
          </p>

          <button
            type="button"
            onClick={toggle}
            aria-expanded={isExpanded}
            aria-controls="risk-flag-detail"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 text-xs font-bold text-rose-800 transition-colors duration-150 hover:bg-rose-100 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-900/30"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={15} aria-hidden="true" />
                Ocultar detalle
              </>
            ) : (
              <>
                <ChevronDown size={15} aria-hidden="true" />
                Ver detalle
              </>
            )}
          </button>
        </div>

        {isExpanded && (
          <div id="risk-flag-detail" className="mt-1 pb-2">
            {lastUpdated && (
              <p className="mb-3 text-xs font-medium text-rose-800/90 dark:text-rose-300/90">
                Detectadas el{' '}
                {format(new Date(lastUpdated), "d 'de' MMMM 'de' yyyy, HH:mm", {
                  locale: es,
                })}
              </p>
            )}

            {/* Resolución POR BANDERA: cada hecho clínico se dispone por
                separado, no en bloque. */}
            <ul className="space-y-2">
              {flags.map((flag) => (
                <li
                  key={flag}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-rose-200 bg-white px-3 py-2 dark:border-rose-900/40 dark:bg-slate-900"
                >
                  <RiskFlagBadge flags={[flag]} size="md" />
                  <button
                    type="button"
                    onClick={() => handleResolve([flag])}
                    disabled={resolveMutation.isPending}
                    aria-label={`Marcar como resuelta la bandera de ${getRiskFlagMeta(flag).label}`}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-rose-800 transition-colors duration-150 hover:bg-rose-50 disabled:opacity-50 dark:text-rose-300 dark:hover:bg-rose-900/25"
                  >
                    <CheckCircle2 size={15} aria-hidden="true" />
                    Resolver
                  </button>
                </li>
              ))}
            </ul>

            {flags.length > 1 && (
              <button
                type="button"
                onClick={() => handleResolve(flags)}
                disabled={resolveMutation.isPending}
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-rose-800 underline-offset-4 transition-colors duration-150 hover:underline disabled:opacity-50 dark:text-rose-300"
              >
                Resolver las {flags.length} banderas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
