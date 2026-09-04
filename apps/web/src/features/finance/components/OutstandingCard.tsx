import { ArrowRight, HandCoins, Loader2 } from 'lucide-react';
import { WidgetError } from '../../../components/widgets/WidgetError';
import { useOutstanding } from '../api/useFinanceSummary';
import { formatMoney } from '../money';

interface OutstandingCardProps {
  currency: string;
  /** Lleva a la pestaña "Por cobrar", donde se cobra. */
  onSeeAll: () => void;
}

/** Cuántos pacientes se listan en el resumen antes de mandar a la pestaña. */
const PREVIEW_SIZE = 3;

/**
 * Saldo pendiente por paciente, en el Resumen.
 *
 * "¿Quién me debe?" es la pregunta que trae al psicólogo a Finanzas, y la
 * respuesta vivía escondida en la tercera pestaña. Aquí va la cifra y los
 * pacientes con más saldo; cobrar sigue ocurriendo en "Por cobrar".
 */
export function OutstandingCard({ currency, onSeeAll }: OutstandingCardProps) {
  const { data, isLoading, isError, refetch } = useOutstanding();

  const entries = data?.data ?? [];
  const preview = entries.slice(0, PREVIEW_SIZE);
  const rest = entries.length - preview.length;

  return (
    <div className="bg-surface dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <HandCoins size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Por cobrar
            </h3>
            {/* La cifra solo se pinta cuando de verdad la sabemos. */}
            {isError ? (
              // El aviso va en el DOM, no en un `aria-label`: un <p> no expone
              // un rol que lo soporte y el lector solo anunciaba el guion.
              <p className="text-2xl font-bold text-gray-400 dark:text-slate-500">
                <span aria-hidden="true">—</span>
                <span className="sr-only">Por cobrar: no disponible</span>
              </p>
            ) : isLoading ? (
              <p className="flex h-8 items-center text-gray-400 dark:text-slate-500">
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span className="sr-only">Cargando saldo por cobrar</span>
              </p>
            ) : (
              // `amber-700` (4.53:1 sobre lino), no `amber-600` (2.87:1): es
              // dinero real, no decoración. El par oscuro se queda en 400.
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                {formatMoney(data?.total ?? 0, currency)}
              </p>
            )}
          </div>
        </div>
      </div>

      {isError ? (
        <WidgetError what="los saldos por cobrar" onRetry={() => refetch()} />
      ) : isLoading ? null : entries.length === 0 ? (
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
          Todas las sesiones completadas están pagadas.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {preview.map((entry) => (
              <li key={entry.patientId} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-gray-800 dark:text-slate-200">
                  {entry.fullName}
                </span>
                <span className="shrink-0 text-right">
                  <span className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400">
                    {formatMoney(entry.total, currency)}
                  </span>
                  <span className="ml-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                    {entry.sessions === 1 ? '1 sesión' : `${entry.sessions} sesiones`}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onSeeAll}
            className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-kanji-deep transition-colors duration-150 hover:bg-gray-50 dark:border-slate-700 dark:text-kio dark:hover:bg-slate-800"
          >
            {rest > 0
              ? `Ver los ${entries.length} pacientes y cobrar`
              : 'Ver y registrar cobros'}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
