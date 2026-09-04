import { Coffee, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSameDay, isWithinInterval, parseISO, differenceInMinutes, format } from 'date-fns';
import type { Appointment } from '../../types/appointments.types';
import { WidgetError } from './WidgetError';
import { GUTTER } from './SheetSection';
import { SheetSkeletonRows } from './WidgetSkeleton';

interface TodayAgendaWidgetProps {
  appointments: Appointment[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const STATUS_COLORS: Record<Appointment['status'], string> = {
  SCHEDULED: 'bg-blue-500',
  IN_PROGRESS: 'bg-kio',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-gray-400',
  NO_SHOW: 'bg-rose-500',
};

/**
 * El estado, escrito.
 *
 * El punto de 8px no puede ser el único portador: a esa escala un ausente y una
 * cita programada se distinguían solo por rosa contra azul, lo que falla para
 * daltonismo y desaparece del todo para un lector de pantalla — el punto es
 * decorativo dentro de un enlace cuyo nombre accesible era solo el del paciente.
 * Ahora el punto es refuerzo redundante de esta palabra.
 *
 * `SCHEDULED` no lleva palabra porque es el estado por defecto de una fila de
 * agenda: la ausencia de marca es el dato. `IN_PROGRESS` tampoco, porque ya
 * lleva la píldora "Ahora" visible en la misma fila.
 */
const STATUS_LABEL: Partial<Record<Appointment['status'], string>> = {
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
};

const STATUS_TEXT: Partial<Record<Appointment['status'], string>> = {
  COMPLETED: 'text-emerald-700 dark:text-emerald-300',
  CANCELLED: 'text-text-secondary dark:text-slate-400',
  NO_SHOW: 'text-rose-700 dark:text-rose-300',
};

/**
 * El tipo, entero. Antes era `CON` / `EVA` / `SEG` con la etiqueta real solo en
 * `title=`: en táctil, que es donde se usa este producto entre sesiones, `title`
 * no existe, así que era un código indescifrable y puro ruido de escaneo.
 */
const TYPE_LABEL: Record<Appointment['type'], string> = {
  CONSULTATION: 'Consulta',
  EVALUATION: 'Evaluación',
  FOLLOW_UP: 'Seguimiento',
};

/**
 * Cuerpo de la sección HOY.
 *
 * Ya no lleva chrome propio: ni tarjeta blanca, ni borde, ni encabezado. La
 * sección la anuncia `SheetSection`, y estas filas se alinean sobre el mismo
 * canal izquierdo que el resto del documento — la hora ocupa el canal, el punto
 * de estado marca su borde, y la línea vertical del timeline cae exactamente
 * sobre esa vertical.
 */
export function TodayAgendaWidget({
  appointments,
  isLoading,
  isError,
  onRetry,
}: TodayAgendaWidgetProps) {
  const now = new Date();

  // Defensa en profundidad, independiente de la API. Esta sección se titula
  // "Hoy", así que pinta el día local de hoy y nada más: antes confiaba en el
  // parámetro `date` que había enviado y formateaba con 'HH:mm', que descarta
  // el día, de modo que las sesiones de ayer por la tarde aparecían como de hoy.
  const todays = appointments.filter((a) => isSameDay(parseISO(a.startTime), now));
  const hidden = appointments.length - todays.length;

  const sorted = [...todays].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  if (isLoading) {
    return <SheetSkeletonRows count={5} label="tu agenda de hoy" mark="dot" />;
  }

  // Nunca caer al empty state con la petición fallida: "Día libre" ante un
  // error 500 es una afirmación falsa sobre la agenda de un paciente.
  if (isError) return <WidgetError what="tu agenda de hoy" onRetry={onRetry} />;

  if (sorted.length === 0) {
    return (
      <div className="flex items-center gap-3 py-4">
        <span className={`${GUTTER} flex shrink-0 justify-end`}>
          <Coffee size={18} className="text-text-muted dark:text-slate-500" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-text dark:text-white">Día libre</p>
          <p className="mt-0.5 text-xs font-medium text-text-secondary dark:text-slate-400">
            No hay citas programadas para hoy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="relative">
        {/* Espina del timeline: cae sobre el borde derecho del canal izquierdo. */}
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-[73px] top-3 w-px bg-border dark:bg-slate-800"
        />

        {sorted.map((apt) => {
          const startTime = parseISO(apt.startTime);
          const endTime = parseISO(apt.endTime);
          const duration = differenceInMinutes(endTime, startTime);

          // Un ausente no está "en curso" aunque el reloj caiga dentro de su
          // franja: sin excluirlo, la fila mostraba a la vez la píldora "Ahora"
          // y la palabra "No asistió".
          const isNow =
            isWithinInterval(now, { start: startTime, end: endTime }) &&
            apt.status !== 'COMPLETED' &&
            apt.status !== 'CANCELLED' &&
            apt.status !== 'NO_SHOW';
          const isPast = endTime < now && apt.status !== 'IN_PROGRESS';
          const isCancelled = apt.status === 'CANCELLED';
          const statusLabel = STATUS_LABEL[apt.status];

          return (
            <li key={apt.id}>
              {/* La fila cancelada ya NO se atenúa entera.
                  `opacity-60` sobre el enlace completo componía el texto
                  secundario contra el lino a 2.19:1 — por debajo incluso del
                  2.40:1 que esta misma sección corrigió en la hora del pasado,
                  y anulándolo: una fila cancelada Y pasada mostraba su hora
                  (el dato que la identifica) a 2.19:1 en vez de a 4.30:1.
                  La cancelación ya viaja en tres portadores redundantes que no
                  dependen del contraste: el tachado del nombre, el punto gris
                  y la palabra "Cancelada" en el grupo de meta. */}
              <Link
                to={`/session/${apt.id}`}
                className={`group relative flex min-h-11 items-center gap-3 rounded-xl py-2 pr-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kio ${
                  isNow ? 'bg-kio-light dark:bg-kio/10' : 'hover:bg-secondary dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Canal izquierdo: la hora.
                    La hora de una sesión pasada sigue siendo el dato que
                    identifica la fila. En `text-muted` medía 2.40:1 sobre el
                    lino: apagada hasta desaparecer, no apagada. El tono
                    secundario la deja por debajo del presente (4.30:1 frente a
                    los 10.8:1 del futuro) sin dejar de leerse.
                    Es una mejora, no un aprobado: 4.30:1 sigue por debajo de
                    4.5:1. El suelo lo pone el token `--text-secondary`
                    (#64748b sobre #f5f3ef) y afecta a todo el producto, así
                    que subirlo es un cambio de token, no de esta fila. Hoy no
                    hay estándar de accesibilidad acordado (PRODUCT.md, sección
                    "Accessibility & Inclusion": decisión abierta). */}
                <span
                  className={`${GUTTER} shrink-0 text-right text-xs font-bold tabular-nums ${
                    isNow
                      ? 'text-kanji-deep dark:text-kio'
                      : isPast
                        ? 'text-text-secondary dark:text-slate-400'
                        : 'text-text dark:text-white'
                  }`}
                >
                  {format(startTime, 'HH:mm')}
                </span>

                {/* Punto de estado, sobre la espina. Decorativo: el estado que
                    no es "programada" va escrito en el grupo de meta. */}
                <span
                  aria-hidden="true"
                  className="relative z-10 flex w-2.5 shrink-0 items-center justify-center"
                >
                  <span
                    className={`h-2 w-2 rounded-full transition-transform ${
                      isNow
                        ? 'scale-125 bg-kio'
                        : `${STATUS_COLORS[apt.status]} ${isPast ? 'opacity-60' : ''}`
                    }`}
                  />
                  {isNow && (
                    <span className="absolute h-3.5 w-3.5 rounded-full ring-2 ring-kio/40" />
                  )}
                </span>

                {/* Paciente + meta. Envuelven a dos líneas cuando la fila se
                    estrecha, en vez de exprimir el nombre hasta la elipsis. */}
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    className={`min-w-[7rem] flex-1 truncate text-sm font-bold transition-colors group-hover:text-kanji-deep dark:group-hover:text-kio ${
                      isPast && !isNow ? 'text-text-secondary dark:text-slate-400' : 'text-text dark:text-white'
                    } ${isCancelled ? 'line-through' : ''}`}
                  >
                    {apt.patient.fullName}
                  </span>

                  <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                    {isNow && (
                      <span className="rounded-full bg-kanji-deep px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                        Ahora
                      </span>
                    )}
                    {statusLabel && (
                      <span className={`text-[11px] font-bold ${STATUS_TEXT[apt.status] ?? ''}`}>
                        {statusLabel}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-text-secondary dark:text-slate-400">
                      {TYPE_LABEL[apt.type]}
                    </span>
                    <span className="w-12 text-right text-[11px] font-medium tabular-nums text-text-secondary dark:text-slate-400">
                      {duration} min
                    </span>
                  </span>
                </span>

                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  className="shrink-0 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 dark:text-slate-500"
                />
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Si la API vuelve a devolver otro día, decirlo en vez de tirar filas. */}
      {hidden > 0 && (
        <p className="mt-3 pl-[4.25rem] text-[11px] font-medium text-text-secondary dark:text-slate-400">
          {hidden === 1
            ? 'Se ocultó 1 cita que no corresponde a hoy.'
            : `Se ocultaron ${hidden} citas que no corresponden a hoy.`}
        </p>
      )}
    </div>
  );
}
