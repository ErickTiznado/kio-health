import { Compass } from 'lucide-react';
import { isSameDay, parseISO } from 'date-fns';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import { useDashboardData } from '../hooks/use-dashboard-data';
import { formatDateHeader, getGreeting } from '../lib/dashboard.helpers';
import { NextAppointmentWidget } from '../components/widgets/NextAppointmentWidget';
import { EndOfDayWidget } from '../components/widgets/EndOfDayWidget';
import { AvailabilityWidget } from '../components/widgets/AvailabilityWidget';
import { AttentionPanel } from '../components/widgets/PendingNotesWidget';
import { RecentPatientsWidget } from '../components/widgets/RecentPatientsWidget';
import { TodayAgendaWidget } from '../components/widgets/TodayAgendaWidget';
import { SheetSection } from '../components/widgets/SheetSection';
import { useDocumentTitle } from '../hooks/use-document-title';
import { useTourStore } from '../stores/tour.store';

/**
 * Cifra que la cabecera todavía no puede afirmar.
 *
 * Un guion largo, no un cero: el cero es un dato y aquí no lo hay. El nombre
 * accesible dice cuál de las dos cosas pasa, porque un guion suelto no se lee.
 */
function UnknownValue({ state }: { state: 'loading' | 'error' }) {
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="sr-only">{state === 'error' ? 'No disponible' : 'Cargando'}</span>
    </>
  );
}

/**
 * Dashboard — "La hoja de sala".
 *
 * THESIS: el dashboard es un documento reglado, no un mosaico de tarjetas. La
 * disposición anterior repartía cinco superficies de densidades distintas por
 * una rejilla de 12 columnas: nada compartía eje de alineación y el aire entre
 * islas era espacio muerto, no jerarquía. Aquí hay un solo canal izquierdo de
 * 56px por el que caen las horas, los contadores y los iconos de estado, y las
 * secciones se anuncian con una etiqueta en versalitas y una regla de 1px.
 * Se rechaza el arreglo por defecto de la categoría: la parrilla de tarjetas
 * KPI de igual tamaño.
 *
 * OWN-WORLD: el sistema Kio sin desviación — lino cálido de base, blanco solo
 * dentro de contenedores, púrpura escaso, planitud, regla de 1px antes que
 * sombra. La única superficie a sangre con la rampa de marca es la banda AHORA.
 *
 * STORY: el clínico abre esto entre sesiones. Lee de arriba abajo — a quién
 * atiendo ahora, qué queda hoy, qué debo — y actúa desde la misma fila donde
 * está el dato. El raíl derecho es consulta, nunca tarea. Pasadas las 18:00 y
 * sin nada más que atender, la primera sección deja de ser AHORA y pasa a ser
 * el CIERRE DEL DÍA: la curva tenía principio pero no final, y el momento en que
 * por fin hay tiempo de escribir las notas que este dashboard cuenta era justo
 * el que no estaba modelado.
 *
 * FIRST VIEWPORT: encabezado con fecha, saludo y el estado del día a la
 * derecha; debajo, la banda AHORA a todo el ancho de la columna principal con
 * el nombre del paciente a `text-3xl` y la acción primaria en su misma fila;
 * luego HOY como línea de tiempo continua. El raíl (desde `xl`) abre con la
 * rejilla de disponibilidad del mes.
 *
 * FORM: estructura 3 de la lista de candidatos ordenada por resonancia
 * (hoja de traspaso / worklist clínico). Seed 43e98f96.
 *
 * El orden del código es el orden móvil; en `xl` el raíl se separa a la derecha.
 */
export function DashboardPage() {
  const { user } = useAuthStore();
  const { startTour } = useTourStore();
  const {
    nextAppointment,
    recentPatients,
    calendarCells,
    pendingNotesCount,
    pendingNoteAppointmentIds,
    riskFlagsCount,
    todayAppointments,
    isLoading,
    isTodayLoading,
    isPendingNotesLoading,
    isRiskFlagsLoading,
    isCalendarLoading,
    isRecentPatientsLoading,
    isAfterHours,
    errors,
    retry,
  } = useDashboardData();

  const userName = user?.fullName || user?.email?.split('@')[0] || 'Profesional';

  const now = new Date();

  // El mismo filtro local que aplica la sección HOY: el contador del encabezado
  // no puede contar citas que la lista no va a pintar.
  const todays = todayAppointments.filter((a) => isSameDay(parseISO(a.startTime), now));
  const completed = todays.filter((a) => a.status === 'COMPLETED').length;

  const titleLabel =
    todays.length > 0
      ? `Kio (${todays.length} ${todays.length === 1 ? 'cita' : 'citas'})`
      : 'Dashboard';
  useDocumentTitle(titleLabel);

  // El contador de HOY y el de PENDIENTE salen de peticiones distintas, así que
  // cada uno responde por la suya. Condicionar los dos al estado de la agenda de
  // hoy — como se hacía — permitía que la cabecera imprimiera un tranquilo
  // "Pendiente 0" justo encima de una sección que ya estaba mostrando un
  // WidgetError de banderas de riesgo: dos afirmaciones contradictorias sobre el
  // riesgo de un paciente, en pantalla a la vez.
  const todayState = errors.today ? 'error' : isTodayLoading ? 'loading' : 'ready';
  // El total de PENDIENTE suma las dos fuentes, así que sí depende de las dos:
  // no se puede imprimir la suma sin ambos sumandos.
  const attentionState =
    errors.pendingNotes || errors.riskFlags
      ? 'error'
      : isPendingNotesLoading || isRiskFlagsLoading
        ? 'loading'
        : 'ready';
  // El cierre del día habla solo de notas, así que responde solo por su
  // petición: un fallo de banderas de riesgo no es un fallo del conteo de
  // notas, y presentarlo como tal inventaba un error que no ocurrió.
  const pendingNotesState = errors.pendingNotes
    ? 'error'
    : isPendingNotesLoading
      ? 'loading'
      : 'ready';

  const attentionTotal = riskFlagsCount + pendingNotesCount;

  // El atajo de una sola nota.
  //
  // Con una única nota pendiente, `/agenda?pendingNotes=true` es un rodeo: la
  // agenda filtrada se abre para mostrar exactamente una fila que el clínico
  // tiene que volver a pulsar. Con dos o más, el filtro sí es el destino
  // correcto — es la única vista que las reúne.
  //
  // Se exige que el id venga de verdad y que la lista traiga exactamente uno.
  // El servidor acota `appointmentIds` a 50, de modo que la lista puede quedarse
  // corta respecto al contador; enlazar a una sesión deducida en vez de leída
  // sería mandar al clínico a la nota equivocada, que es peor que el rodeo.
  //
  // LO QUE ESTE ATAJO NO ARREGLA (comprobado, no supuesto).
  // El destino es hoy un editor en SOLO LECTURA. `getPendingNotesCount`
  // (apps/api/src/appointments/appointments.service.ts) cuenta exactamente
  // `status: 'COMPLETED', psychNote: null`, y `SessionPage.tsx:15` mete
  // 'COMPLETED' en `CLOSED_STATUSES`, de donde sale el `readOnly` que pasa a
  // `EditorContainer` (SessionPage.tsx:197 y :266). Es decir: el 100% de las
  // citas que este contador cuenta aterrizan en una pantalla que no deja
  // escribir la nota que falta, solo agregar un anexo — que no rellena
  // `psychNote`, así que el contador no baja.
  // El backend NO comparte esa regla: `upsertPsychNote` solo bloquea pasadas
  // 24h cuando YA existe nota (`if (existing) throw`), o sea que la nota
  // inicial de una cita COMPLETED sí se puede crear.
  // El atajo no introduce el callejón — la ruta larga por /agenda llega al
  // mismo sitio vía AppointmentDrawer — pero tampoco lo cierra, y la
  // afirmación de que estaba "completo de punta a punta" era falsa: la
  // comprobación se había hecho contra el endpoint de LECTURA, no contra el de
  // escritura.
  // El arreglo vive en el carril de sesión, no aquí: `readOnly` debería ser
  // espejo exacto del backend (solo lectura si YA hay nota, o si el estado es
  // CANCELLED/NO_SHOW), dejando el bloqueo por deadline como está. No se toca
  // desde este carril ni se disfraza con copy: mientras eso no ocurra, la fila
  // "Notas pendientes" es un callejón sin salida gane o no el atajo.
  const soloPendingNoteId =
    pendingNotesState === 'ready' &&
    pendingNotesCount === 1 &&
    pendingNoteAppointmentIds.length === 1
      ? (pendingNoteAppointmentIds[0] ?? null)
      : null;

  // A partir de las 18:00 la cabecera ya dice "Buenas noches". Si además no
  // queda nada por atender hoy, la banda AHORA no tiene ningún ahora que
  // mostrar: en su lugar va el cierre del día. El día no se declara cerrado
  // sobre datos que no se pudieron leer ni sobre una petición en vuelo — por eso
  // se exigen las dos fuentes resueltas. `todayState === 'ready'` es la
  // condición que sostiene el titular "Terminaste por hoy" y el `today` no nulo
  // que espera EndOfDayWidget: `todays` vale `[]` mientras la agenda carga, de
  // modo que sin ella `hasWorkLeftToday` sería falso por ignorancia y el primer
  // pintado después de las 18:00 daría el día por cerrado sin haberlo mirado.
  // Si alguna vez se relaja, hay que ensanchar el tipo de esa prop a la vez.
  const nextIsToday = nextAppointment ? isSameDay(parseISO(nextAppointment.startTime), now) : false;
  const hasWorkLeftToday = todays.some(
    (a) => (a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS') && parseISO(a.endTime) > now,
  );
  const showEndOfDay =
    isAfterHours &&
    !isLoading &&
    !errors.next &&
    !nextIsToday &&
    todayState === 'ready' &&
    !hasWorkLeftToday;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1600px] pb-10">
        {/* ── Encabezado de la hoja ─────────────────────────── */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-border pb-4 dark:border-slate-800">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">
              {formatDateHeader()}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-kanji-deep dark:text-white">
              {getGreeting()}, {userName}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Estado del día en texto, no en tarjetas KPI. */}
            <dl className="flex items-center gap-4">
              <div className="text-right">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">
                  Hoy
                </dt>
                <dd className="text-sm font-bold tabular-nums text-text dark:text-white">
                  {todayState === 'ready' ? (
                    `${completed}/${todays.length}`
                  ) : (
                    <UnknownValue state={todayState} />
                  )}
                </dd>
              </div>
              <span aria-hidden="true" className="h-8 w-px bg-border dark:bg-slate-800" />
              <div className="text-right">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">
                  Pendiente
                </dt>
                <dd
                  className={`text-sm font-bold tabular-nums ${
                    attentionState === 'ready' && attentionTotal > 0
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-text dark:text-white'
                  }`}
                >
                  {attentionState === 'ready' ? (
                    attentionTotal
                  ) : (
                    <UnknownValue state={attentionState} />
                  )}
                </dd>
              </div>
            </dl>

            {/* El recorrido guiado se invoca, nunca se lanza solo. */}
            <button
              type="button"
              onClick={startTour}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-kanji-deep transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kio dark:border-slate-700 dark:bg-slate-800 dark:text-kio dark:hover:bg-slate-700"
            >
              <Compass size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Ver recorrido guiado</span>
              <span className="sr-only sm:hidden">Ver recorrido guiado</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
          {/* ── Columna principal: el trabajo ───────────────── */}
          <div className="min-w-0 space-y-8">
            {showEndOfDay ? (
              <SheetSection label="Cierre del día">
                <EndOfDayWidget
                  // `showEndOfDay` ya exige `todayState === 'ready'`: aquí el
                  // recuento es un hecho, no una posibilidad.
                  today={{ completed, total: todays.length }}
                  pendingNotes={
                    pendingNotesState === 'ready' ? pendingNotesCount : pendingNotesState
                  }
                  pendingNoteId={soloPendingNoteId}
                  next={nextAppointment}
                />
              </SheetSection>
            ) : (
              <SheetSection label="Ahora">
                <NextAppointmentWidget
                  appointment={nextAppointment}
                  isLoading={isLoading}
                  isError={errors.next}
                  onRetry={retry.next}
                />
              </SheetSection>
            )}

            <SheetSection
              label="Hoy"
              meta={
                todayState === 'ready' && todays.length > 0 ? (
                  <span className="tabular-nums">
                    {completed} de {todays.length} completadas
                  </span>
                ) : null
              }
            >
              <TodayAgendaWidget
                appointments={todayAppointments}
                isLoading={isTodayLoading}
                isError={errors.today}
                onRetry={retry.today}
              />
            </SheetSection>

            <SheetSection label="Pendiente">
              <AttentionPanel
                pendingNotesCount={pendingNotesCount}
                pendingNoteId={soloPendingNoteId}
                riskFlagsCount={riskFlagsCount}
                isPendingNotesLoading={isPendingNotesLoading}
                isRiskFlagsLoading={isRiskFlagsLoading}
                isError={errors.pendingNotes || errors.riskFlags}
                onRetry={retry.attention}
              />
            </SheetSection>
          </div>

          {/* ── Raíl: material de consulta ──────────────────── */}
          <aside className="min-w-0 space-y-8">
            <SheetSection label="Disponibilidad" headingId="availability-heading">
              <AvailabilityWidget
                cells={calendarCells}
                isLoading={isCalendarLoading}
                isError={errors.calendar}
                onRetry={retry.calendar}
              />
            </SheetSection>

            <SheetSection label="Recientes">
              <RecentPatientsWidget
                patients={recentPatients}
                isLoading={isRecentPatientsLoading}
                isError={errors.recentPatients}
                onRetry={retry.recentPatients}
              />
            </SheetSection>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
