import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Loader2,
  MoonStar,
  NotebookPen,
  Sunrise,
} from 'lucide-react';
import { format, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types/appointments.types';

/**
 * Lo que la superficie sabe del contador de notas pendientes.
 *
 * Tres cosas distintas, tres valores distintos. Colapsarlas en `number | null`
 * obligaba a esta superficie a traducir todo `null` a "no pudimos contarlas", y
 * una petición en vuelo se anunciaba como un fallo de lectura sobre el contador
 * de notas clínicas: la misma clase de afirmación que la interfaz no puede
 * sostener y que DESIGN.md separa (no hay dato ≠ no se pudo leer), con una
 * tercera confusión encima.
 */
export type PendingNotesState = number | 'loading' | 'error';

interface EndOfDayWidgetProps {
  /**
   * Recuento de hoy. No admite ausencia a propósito: el día no se declara
   * cerrado sobre una agenda que no se pudo leer ni sobre una que todavía está
   * en vuelo. Esa decisión vive en `showEndOfDay` (DashboardPage), que exige la
   * agenda de hoy resuelta antes de montar este widget — el titular "Terminaste
   * por hoy" ya es una afirmación sobre el día. Si se relaja aquella condición,
   * este tipo tiene que ensancharse en el mismo cambio.
   */
  today: { completed: number; total: number };
  /**
   * Notas que aún se deben. Un número es lo único que autoriza a decir cuántas
   * faltan; `'loading'` y `'error'` se pintan cada uno con su frase.
   */
  pendingNotes: PendingNotesState;
  /**
   * Id de la única cita que debe nota, cuando `pendingNotes` vale exactamente 1.
   *
   * Lo calcula el dashboard, que es quien puede comprobar que el id llegó de
   * verdad. `null` significa "no hay atajo" y el botón vuelve a la agenda
   * filtrada. Aquí nunca se deduce.
   */
  pendingNoteId?: string | null;
  /** Próxima cita a partir de ahora. Ya no queda nada hoy, así que es de otro día. */
  next: Appointment | null;
}

type RowTone = 'done' | 'pending' | 'neutral';

const TONES: Record<RowTone, string> = {
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  neutral: 'bg-secondary text-text-secondary dark:bg-slate-800 dark:text-slate-300',
};

function CloseRow({
  icon,
  tone,
  children,
  action,
}: {
  icon: ReactNode;
  tone: RowTone;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}
      >
        {icon}
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium text-text dark:text-slate-200">{children}</p>
      {action}
    </li>
  );
}

/** Cómo se dice "mañana empiezas a las…" según dónde caiga la próxima cita. */
function nextLine(next: Appointment | null): ReactNode {
  if (!next) return 'No tienes ninguna cita programada.';

  const start = parseISO(next.startTime);
  if (isTomorrow(start)) {
    return (
      <>
        Mañana empiezas a las <span className="font-bold tabular-nums">{format(start, 'HH:mm')}</span> con{' '}
        <span className="font-bold">{next.patient.fullName}</span>.
      </>
    );
  }

  return (
    <>
      Mañana no tienes citas. La siguiente es el{' '}
      <span className="font-bold">{format(start, "EEEE d 'de' MMMM", { locale: es })}</span> a las{' '}
      <span className="font-bold tabular-nums">{format(start, 'HH:mm')}</span>.
    </>
  );
}

/**
 * El cierre del día.
 *
 * El dashboard solo sabía de mañanas: a las 18:00 el encabezado ya decía
 * "Buenas noches" mientras la sección HOY seguía diciendo "Día libre" y la
 * banda anunciaba "Sin próxima cita" sobre el gradiente de marca a sangre. La
 * curva no tenía cierre, y el momento en que el clínico por fin tiene tiempo de
 * escribir las notas que este dashboard cuenta era justo el que el producto no
 * modelaba.
 *
 * Tres hechos y una acción: qué se cerró, qué se debe, cuándo se vuelve. Sin
 * rampa de marca — el cierre no es la sesión, es el rato después.
 */
export function EndOfDayWidget({
  today,
  pendingNotes,
  pendingNoteId = null,
  next,
}: EndOfDayWidgetProps) {
  const navigate = useNavigate();
  const owesNotes = typeof pendingNotes === 'number' && pendingNotes > 0;

  return (
    <div
      // Mismo anclaje que la banda AHORA: el recorrido guiado apunta a esta
      // posición del documento y a esta hora es esto lo que la ocupa.
      data-tour="tour-next-appointment"
      className="rounded-2xl border border-border bg-surface px-5 py-5 dark:border-slate-800 dark:bg-slate-900 sm:px-7 sm:py-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-kanji-deep dark:bg-slate-800 dark:text-kio"
        >
          <MoonStar size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-tight text-text dark:text-white">
            Terminaste por hoy
          </h3>
          <p className="mt-0.5 text-sm font-medium text-text-secondary dark:text-slate-400">
            Este es el rato para cerrar lo que quedó abierto.
          </p>

          <ul className="mt-4 divide-y divide-border dark:divide-slate-800">
            {/* 1. Lo que se cerró */}
            {today.total === 0 ? (
              <CloseRow icon={<CheckCircle2 size={16} />} tone="neutral">
                Hoy no tenías citas agendadas.
              </CloseRow>
            ) : (
              // Esmeralda solo si de verdad se cerraron todas: "0 de 3" en verde
              // celebraría un día que no se completó.
              <CloseRow
                icon={<CheckCircle2 size={16} />}
                tone={today.completed === today.total ? 'done' : 'neutral'}
              >
                <span className="font-bold tabular-nums">
                  {today.completed} de {today.total}
                </span>{' '}
                {today.total === 1 ? 'sesión completada' : 'sesiones completadas'}.
              </CloseRow>
            )}

            {/* 2. Lo que se debe */}
            {pendingNotes === 'loading' ? (
              <CloseRow
                icon={<Loader2 size={16} className="animate-spin motion-reduce:animate-none" />}
                tone="neutral"
              >
                <span role="status">Estamos contando tus notas pendientes…</span>
              </CloseRow>
            ) : pendingNotes === 'error' ? (
              <CloseRow icon={<HelpCircle size={16} />} tone="neutral">
                <span role="alert">No pudimos contar las notas pendientes.</span>
              </CloseRow>
            ) : owesNotes ? (
              <CloseRow
                icon={<NotebookPen size={16} />}
                tone="pending"
                action={
                  <button
                    type="button"
                    // La agenda filtrada por lo que este contador cuenta, no la
                    // agenda entera. Y si la nota que falta es UNA, ni el filtro
                    // hace falta: se abre esa sesión, en vez de un rodeo por la
                    // agenda para pulsar la única fila que sale.
                    //
                    // OJO — hoy ese destino NO deja escribir. `SessionPage`
                    // marca `readOnly` para status 'COMPLETED', que es
                    // exactamente lo que cuenta `getPendingNotesCount`. El
                    // backend sí permite crear la nota inicial de una cita
                    // completada; el espejo del front es más estricto de la
                    // cuenta. Ver la nota larga en `DashboardPage.tsx`
                    // (soloPendingNoteId). Mientras eso siga así, este botón
                    // acorta el camino a un callejón sin salida — corregirlo es
                    // del carril de sesión, no de este widget.
                    onClick={() =>
                      navigate(
                        pendingNotes === 1 && pendingNoteId
                          ? `/session/${pendingNoteId}`
                          : '/agenda?pendingNotes=true',
                      )
                    }
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-xs font-bold uppercase tracking-wider text-kanji-deep transition-colors hover:bg-secondary active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-kio dark:hover:bg-slate-700"
                  >
                    Escribir
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                }
              >
                Te{' '}
                {pendingNotes === 1 ? (
                  <>
                    falta <span className="font-bold tabular-nums">1</span> nota de sesión
                  </>
                ) : (
                  <>
                    faltan <span className="font-bold tabular-nums">{pendingNotes}</span> notas de sesión
                  </>
                )}
                .
              </CloseRow>
            ) : (
              <CloseRow icon={<CheckCircle2 size={16} />} tone="done">
                No tienes notas pendientes.
              </CloseRow>
            )}

            {/* 3. Cuándo se vuelve */}
            <CloseRow icon={<Sunrise size={16} />} tone="neutral">
              {nextLine(next)}
            </CloseRow>
          </ul>
        </div>
      </div>
    </div>
  );
}
