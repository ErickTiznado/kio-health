import { AlertCircle, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { WidgetError } from './WidgetError';
import { GUTTER } from './SheetSection';
import { SheetSkeletonRow } from './WidgetSkeleton';

type Tone = 'risk' | 'pending' | 'clear';

/**
 * El tono ya no pinta un rectángulo de color: tiñe el contador y su icono, que
 * son el dato. Un bloque ámbar de 5rem de alto para decir "2" era el mayor
 * gasto de espacio por unidad de información de toda la página.
 */
const TONES: Record<Tone, { icon: string; value: string }> = {
  risk: {
    icon: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    value: 'text-rose-700 dark:text-rose-300',
  },
  pending: {
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    value: 'text-amber-700 dark:text-amber-300',
  },
  clear: {
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
};

interface AttentionRowProps {
  tone: Tone;
  title: string;
  subtitle: string;
  icon: ReactNode;
  value: number;
  route: string;
  action: string;
}

function AttentionRow({ tone, title, subtitle, icon, value, route, action }: AttentionRowProps) {
  const navigate = useNavigate();
  const t = TONES[tone];

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Canal izquierdo: el contador, en la misma vertical que las horas de HOY. */}
      <span
        className={`${GUTTER} shrink-0 text-right text-2xl font-bold tabular-nums leading-none ${t.value}`}
      >
        {value}
      </span>

      <span
        aria-hidden="true"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${t.icon}`}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text dark:text-white">{title}</p>
        <p className="mt-0.5 text-xs font-medium text-text-secondary dark:text-slate-400">{subtitle}</p>
      </div>

      <button
        type="button"
        onClick={() => navigate(route)}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-xs font-bold uppercase tracking-wider text-kanji-deep transition-colors hover:bg-secondary active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-kio dark:hover:bg-slate-700"
      >
        {action}
        <ArrowRight size={12} aria-hidden="true" />
      </button>
    </div>
  );
}

interface AttentionPanelProps {
  pendingNotesCount: number;
  /**
   * Id de la única cita que debe nota, cuando el contador vale exactamente 1.
   *
   * Lo calcula el dashboard, que es quien puede comprobar que el id existe de
   * verdad. `null` significa "no hay atajo": el destino vuelve a ser la agenda
   * filtrada. Nunca se deduce aquí.
   */
  pendingNoteId?: string | null;
  riskFlagsCount: number;
  /**
   * Cada contador viene de su propia petición, así que se esperan por separado:
   * una bandera de riesgo que ya llegó no tiene por qué quedarse detrás del
   * recuento de notas.
   */
  isRiskFlagsLoading?: boolean;
  isPendingNotesLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

/**
 * Cuerpo de la sección PENDIENTE.
 *
 * Las banderas de riesgo tienen su propia fila siempre visible y van PRIMERO.
 * Antes se renderizaban solo cuando `pendingNotesCount === 0`, lo que permitía
 * que un trámite administrativo tapara la señal clínica más grave del producto.
 *
 * Los contadores llegan como números planos con `?? 0` por defecto, de modo que
 * durante la carga valen ambos cero. Sin las banderas de carga, esta superficie
 * pintaba "Todo al día · Sin notas pendientes ni banderas de riesgo" en
 * esmeralda mientras aún no sabía nada — la misma afirmación falsa que
 * `WidgetError` impide, entrando por la puerta del loading, y sobre el dato de
 * mayor riesgo del producto.
 */
export function AttentionPanel({
  pendingNotesCount,
  pendingNoteId = null,
  riskFlagsCount,
  isRiskFlagsLoading = false,
  isPendingNotesLoading = false,
  isError,
  onRetry,
}: AttentionPanelProps) {
  if (isError) return <WidgetError what="tus alertas" onRetry={onRetry} />;

  const hasRisk = riskFlagsCount > 0;
  const hasPending = pendingNotesCount > 0;
  const isLoading = isRiskFlagsLoading || isPendingNotesLoading;

  // El estado tranquilizador es el único que exige saberlo todo: decirlo con
  // una de las dos peticiones aún en vuelo afirma la ausencia de algo que no se
  // ha mirado.
  const canReassure = !isLoading && !hasRisk && !hasPending;

  return (
    <>
      {isLoading && (
        <span role="status" className="sr-only">
          Cargando tus alertas…
        </span>
      )}

      <div className="divide-y divide-border dark:divide-slate-800">
        {isRiskFlagsLoading ? (
          <SheetSkeletonRow width="w-48" />
        ) : (
          hasRisk && (
            <AttentionRow
              tone="risk"
              title="Banderas de riesgo"
              subtitle="Pacientes que requieren atención"
              icon={<AlertTriangle size={16} />}
              value={riskFlagsCount}
              // `?flags=true` abre la pestaña "Con Riesgo" en PatientsPage.
              route="/patients?flags=true"
              action="Revisar"
            />
          )
        )}

        {isPendingNotesLoading ? (
          <SheetSkeletonRow width="w-44" />
        ) : (
          hasPending && (
            <AttentionRow
              tone="pending"
              title="Notas pendientes"
              subtitle="Sesiones completadas sin nota clínica"
              icon={<AlertCircle size={16} />}
              value={pendingNotesCount}
              // `/agenda` a secas dejaba al clínico buscando cuatro sesiones sin
              // nota en un mes entero de citas. `?pendingNotes=true` deja la
              // agenda filtrada por lo que este contador cuenta.
              //
              // Y cuando la nota que falta es UNA, ni siquiera hace falta el
              // filtro: la agenda se abriría para enseñar una sola fila que hay
              // que volver a pulsar. Con el id en la mano se va derecho a la
              // sesión. `pendingNoteId` solo llega no nulo si el contador vale 1
              // y el id existe de verdad; si no, el filtro sigue siendo correcto.
              //
              // OJO — el destino, por cualquiera de los dos caminos, es hoy un
              // editor en solo lectura: `SessionPage` marca `readOnly` para
              // status 'COMPLETED', que es justo lo que cuenta este contador.
              // La etiqueta "Resolver" promete más de lo que la pantalla de
              // destino puede hacer. No se rebaja el copy desde aquí porque
              // eso daría por buena la restricción: el arreglo correcto es
              // alinear `readOnly` con la regla del backend (que sí permite
              // crear la nota inicial que falta). Ver `DashboardPage.tsx`,
              // bloque `soloPendingNoteId`.
              route={
                pendingNotesCount === 1 && pendingNoteId
                  ? `/session/${pendingNoteId}`
                  : '/agenda?pendingNotes=true'
              }
              action="Resolver"
            />
          )
        )}

        {canReassure && (
          <div className="flex items-center gap-3 py-3">
            <span className={`${GUTTER} flex shrink-0 justify-end`}>
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-text dark:text-white">Todo al día</p>
              <p className="mt-0.5 text-xs font-medium text-text-secondary dark:text-slate-400">
                Sin notas pendientes ni banderas de riesgo.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
