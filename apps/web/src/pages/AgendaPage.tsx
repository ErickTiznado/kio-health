import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { startOfWeek, addWeeks, subWeeks, addDays, subDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Plus, CheckCircle2, XCircle, EyeOff, FileClock, X } from 'lucide-react';
import { useIsMobile } from '../hooks/use-is-mobile';
import { DashboardLayout } from '../components/DashboardLayout';
import { WidgetError } from '../components/widgets/WidgetError';
import { WeeklyCalendarGrid } from '../features/calendar/components/WeeklyCalendarGrid';
import { DailyCalendarGrid } from '../features/calendar/components/DailyCalendarGrid';
import { CalendarGridSkeleton } from '../features/calendar/components/CalendarGridSkeleton';
import { AppointmentDrawer } from '../features/calendar/components/AppointmentDrawer';
import { ScheduleAppointmentModal } from '../features/calendar/components/ScheduleAppointmentModal';
import { PaymentModal } from '../features/calendar/components/PaymentModal';
import { fetchAppointmentsByRange, rescheduleAppointment, cancelAppointment } from '../lib/appointments.api';
import type { Appointment } from '../types/appointments.types';
import type { CalendarView } from '../types/agenda.types';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/errors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '../hooks/use-document-title';

/**
 * Una sesión tiene nota pendiente cuando ya ocurrió y no hay nota asociada.
 *
 * `GET /appointments` (día y rango) devuelve `hasNote` por cita, así que el
 * filtro `?pendingNotes=true` es exacto y no una aproximación por estado. El
 * objeto de la nota no viaja a propósito: un booleano no filtra ids de notas
 * clínicas a una vista de calendario.
 *
 * `hasNote === false` explícito y no `!hasNote`: los endpoints de mutación
 * (cancelar, reagendar, cobrar) devuelven la cita sin ese campo, y "ausente"
 * no es lo mismo que "sin nota".
 *
 * PENDIENTE (decisión de producto, no de barrido): el criterio coincide con el
 * de `GET /appointments/pending-notes-count` (`status COMPLETED` + sin nota),
 * pero la COBERTURA no. El contador del dashboard se pide sin `from`/`to`, o
 * sea sobre el histórico completo, y esta pantalla solo puede filtrar la semana
 * visible. Con notas pendientes de hace meses, `?pendingNotes=true` aterriza en
 * una semana sin resultados. El aviso de abajo no miente («Prueba en semanas
 * anteriores»), pero el atajo falla justo en el caso que lo justifica. Cerrarlo
 * exige decidir entre acotar el contador al rango que la agenda puede mostrar
 * (el endpoint ya acepta `from`/`to`) o traer en la URL la semana de la nota
 * pendiente más antigua; las dos mitades viven fuera de este archivo.
 */
function hasPendingNote(appointment: Appointment): boolean {
  return appointment.status === 'COMPLETED' && appointment.hasNote === false;
}

const STATUS_FILTERS = [
  { key: 'COMPLETED', label: 'Completadas', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  { key: 'SCHEDULED', label: 'Agendadas', icon: Calendar, iconColor: 'text-blue-500' },
  { key: 'CANCELLED', label: 'Canceladas', icon: XCircle, iconColor: 'text-red-500' },
] as const;

const CHIP_BASE =
  'inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-bold transition-colors duration-150';
const CHIP_ACTIVE =
  'bg-kanji/10 dark:bg-kio/10 text-kanji-deep dark:text-kio ring-1 ring-kanji/30 dark:ring-kio/30';
// A opacidad plena: `kanji-deep/70` sobre lino cae a ~3.5:1 y este texto es de
// 12px. Lo que separa activo de inactivo es el fondo y el anillo, no el tono.
const CHIP_IDLE =
  'text-kanji-deep dark:text-kio hover:bg-gray-100 dark:hover:bg-slate-700';
const CHIP_DISABLED = 'text-gray-400 dark:text-slate-500 cursor-not-allowed';

/**
 * Agenda Page — Interactive weekly/daily calendar view.
 * Fetches real appointments from the backend API for the visible date range.
 */
export function AgendaPage() {
  useDocumentTitle('Agenda');

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [activeView, setActiveView] = useState<CalendarView>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scheduleSlot, setScheduleSlot] = useState<Date | null>(null);
  const [rescheduleAppointmentInfo, setRescheduleAppointmentInfo] = useState<Appointment | null>(null);
  const [paymentAppointment, setPaymentAppointment] = useState<Appointment | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hideCancelled, setHideCancelled] = useState(false);
  const queryClient = useQueryClient();

  /* ── Filtro de notas pendientes (entra por URL desde el dashboard) ── */

  const [searchParams, setSearchParams] = useSearchParams();
  const pendingNotesOnly = searchParams.get('pendingNotes') === 'true';

  const clearPendingNotesFilter = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('pendingNotes');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  /* ── Data fetching ── */

  const weekStart = activeView === 'day'
    ? startOfWeek(selectedDay, { weekStartsOn: 1 })
    : currentWeekStart;

  const weekEnd = addDays(weekStart, 6);
  const fromStr = format(weekStart, 'yyyy-MM-dd');
  const toStr = format(weekEnd, 'yyyy-MM-dd');

  const { data: appointments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments', 'range', fromStr, toStr],
    queryFn: () => fetchAppointmentsByRange(fromStr, toStr),
    staleTime: 1000 * 60 * 2,
  });

  /* ── Filter Logic ── */

  const toggleFilter = useCallback((filterKey: string) => {
    // "Ocultar canceladas" y el chip de canceladas se contradicen: activar uno
    // apaga el otro en vez de dejar un filtro que no puede devolver nada.
    if (filterKey === 'CANCELLED') setHideCancelled(false);
    setActiveFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((k) => k !== filterKey)
        : [...prev, filterKey]
    );
  }, []);

  const toggleHideCancelled = useCallback(() => {
    setHideCancelled((prev) => {
      if (!prev) setActiveFilters((filters) => filters.filter((k) => k !== 'CANCELLED'));
      return !prev;
    });
  }, []);

  /**
   * Todo lo que sobrevive a los filtros que NO son el grupo de estados.
   * Es la base honesta de los contadores: con "Ocultar canceladas" activo, el
   * chip de canceladas anunciaba un número de citas que ya no se veían.
   */
  const countableAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (hideCancelled && appointment.status === 'CANCELLED') return false;
      if (pendingNotesOnly && !hasPendingNote(appointment)) return false;
      return true;
    });
  }, [appointments, hideCancelled, pendingNotesOnly]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const appointment of countableAppointments) {
      counts[appointment.status] = (counts[appointment.status] ?? 0) + 1;
    }
    return counts;
  }, [countableAppointments]);

  const filteredAppointments = useMemo(() => {
    // El grupo de estados es OR-inclusivo: sin selección, no filtra.
    if (activeFilters.length === 0) return countableAppointments;
    return countableAppointments.filter((appointment) => activeFilters.includes(appointment.status));
  }, [countableAppointments, activeFilters]);

  /**
   * `hasPendingNote` solo puede ser cierta en sesiones completadas, así que el
   * filtro de notas pendientes vacía por construcción cualquier otro estado.
   * El chip queda desactivado en vez de ofrecer un cruce imposible.
   */
  const isStatusBlockedByPendingNotes = useCallback(
    (status: string) => pendingNotesOnly && status !== 'COMPLETED',
    [pendingNotesOnly],
  );

  /* ── Mobile Logic ── */
  const isMobile = useIsMobile();
  // Ajuste de estado durante el render, no en un efecto: así no hay un
  // fotograma intermedio con la vista equivocada. Arranca en `false` a
  // propósito para que una primera medida ya móvil cuente como "entrar".
  const [wasMobile, setWasMobile] = useState(false);

  if (isMobile !== wasMobile) {
    // Solo al ENTRAR en móvil. Reiniciar en cada transición devolvía a hoy sin
    // avisar a quien estaba mirando la semana siguiente.
    setWasMobile(isMobile);
    if (isMobile) {
      setActiveView('day');
      setSelectedDay(new Date());
    }
  }

  /* ── Navigation handlers ── */

  const navigatePrevious = useCallback(() => {
    if (activeView === 'week') {
      setCurrentWeekStart((prev) => subWeeks(prev, 1));
    } else {
      setSelectedDay((prev) => subDays(prev, 1));
    }
  }, [activeView]);

  const navigateNext = useCallback(() => {
    if (activeView === 'week') {
      setCurrentWeekStart((prev) => addWeeks(prev, 1));
    } else {
      setSelectedDay((prev) => addDays(prev, 1));
    }
  }, [activeView]);

  const navigateToToday = useCallback(() => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    setSelectedDay(today);
  }, []);

  /* ── View switching ── */

  const switchToWeekView = useCallback(() => {
    setActiveView('week');
    setCurrentWeekStart(startOfWeek(selectedDay, { weekStartsOn: 1 }));
  }, [selectedDay]);

  const switchToDayView = useCallback(() => {
    setActiveView('day');
    // Aterriza en hoy si hoy está en la semana visible; si no, en su primer día.
    // Saltar siempre a hoy descartaba la semana que el clínico estaba mirando.
    const today = new Date();
    const weekEndDate = addDays(currentWeekStart, 7);
    const todayIsVisible = today >= currentWeekStart && today < weekEndDate;
    setSelectedDay(todayIsVisible ? today : currentWeekStart);
  }, [currentWeekStart]);

  /* ── Drawer handlers ── */

  const handleSelectAppointment = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleQuickPay = useCallback((appointment: Appointment) => {
    setPaymentAppointment(appointment);
  }, []);

  const handleQuickReschedule = useCallback((appointment: Appointment) => {
    setRescheduleAppointmentInfo(appointment);
  }, []);

  /* ── Scheduling handlers ── */

  const handleSlotClick = useCallback((date: Date) => {
    setScheduleSlot(date);
  }, []);

  const handleCloseSchedule = useCallback(() => {
    setScheduleSlot(null);
  }, []);

  const handleNewAppointmentClick = useCallback(() => {
    // Open modal with current time rounded to next 30 min
    const now = new Date();
    const minutes = now.getMinutes();
    const rounded = new Date(now);
    if (minutes < 30) {
      rounded.setMinutes(30, 0, 0);
    } else {
      rounded.setHours(rounded.getHours() + 1, 0, 0, 0);
    }
    setScheduleSlot(rounded);
  }, []);

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; startTime: string; duration?: number }) =>
      rescheduleAppointment(id, payload),
    onSuccess: () => {
      toast.success('Cita reagendada correctamente');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Error al reagendar la cita'));
    },
  });

  const handleReschedule = useCallback((appointmentId: string, newStartTime: Date, duration?: number) => {
    rescheduleMutation.mutate({
      id: appointmentId,
      startTime: newStartTime.toISOString(),
      duration,
    });
  }, [rescheduleMutation]);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => {
      toast.success('Cita cancelada correctamente');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsDrawerOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Error al cancelar la cita'));
    },
  });

  const handleCancel = useCallback((appointmentId: string) => {
    cancelMutation.mutate(appointmentId);
  }, [cancelMutation]);

  /* ── Labels ── */

  const dateLabel = useMemo(() => {
    if (activeView === 'day') {
      return format(selectedDay, "EEEE, d 'de' MMMM yyyy", { locale: es });
    }
    const startFormatted = format(currentWeekStart, "d 'de' MMM", { locale: es });
    const endDate = addDays(currentWeekStart, 6);
    const endFormatted = format(endDate, "d 'de' MMM, yyyy", { locale: es });
    return `${startFormatted} – ${endFormatted}`;
  }, [currentWeekStart, selectedDay, activeView]);

  const previousAriaLabel = activeView === 'week' ? 'Semana anterior' : 'Día anterior';
  const nextAriaLabel = activeView === 'week' ? 'Semana siguiente' : 'Día siguiente';

  const countsAreKnown = !isLoading && !isError;
  const showEmptyNotice = countsAreKnown && filteredAppointments.length === 0;

  /**
   * El cruce puede llegar ya hecho desde la URL (`?pendingNotes=true` con un
   * chip de estado ya puesto), así que además de desactivar los chips el aviso
   * nombra la causa real en vez de culpar al rango de fechas.
   */
  const filtersContradictEachOther =
    pendingNotesOnly && activeFilters.length > 0 && !activeFilters.includes('COMPLETED');

  const emptyNotice = appointments.length === 0
    ? 'No hay citas agendadas en este rango.'
    : filtersContradictEachOther
      ? 'El filtro de notas pendientes solo alcanza sesiones completadas, así que no puede cruzarse con los estados que tienes seleccionados. Quita uno de los dos filtros.'
      : pendingNotesOnly
        ? 'Ninguna sesión de este rango tiene nota pendiente. Prueba en semanas anteriores.'
        : 'Ninguna cita de este rango coincide con los filtros activos.';

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] -m-4 sm:-m-6">
        {/* Page Header */}
        <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-gray-200 dark:border-slate-800 bg-surface dark:bg-slate-900 z-30">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-kanji-deep dark:text-kio tracking-tight">Mi agenda</h1>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mt-0.5 capitalize">{dateLabel}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Navigation */}
              <div className="flex items-center gap-1 bg-surface dark:bg-slate-800 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-sm p-1">
                <button
                  type="button"
                  onClick={navigatePrevious}
                  className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-kio-light dark:hover:bg-slate-700 text-kanji-deep dark:text-kio transition-colors duration-150"
                  aria-label={previousAriaLabel}
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={navigateToToday}
                  className="min-h-11 px-4 rounded-xl text-xs font-bold text-kanji-deep dark:text-kio hover:bg-kio-light dark:hover:bg-slate-700 transition-colors duration-150"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={navigateNext}
                  className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-kio-light dark:hover:bg-slate-700 text-kanji-deep dark:text-kio transition-colors duration-150"
                  aria-label={nextAriaLabel}
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>

              {/* View Toggle — también en móvil: la vista de día es el arranque,
                  no la única vista disponible. */}
              <div className="flex items-center bg-surface dark:bg-slate-800 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-sm p-1">
                <button
                  type="button"
                  onClick={switchToWeekView}
                  aria-pressed={activeView === 'week'}
                  className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 ${activeView === 'week'
                    ? 'bg-kanji-deep dark:bg-kio text-white dark:text-slate-900'
                    : 'text-kanji-deep dark:text-kio hover:bg-kio-light dark:hover:bg-slate-700'
                    }`}
                >
                  <CalendarDays size={15} aria-hidden="true" />
                  Semana
                </button>
                <button
                  type="button"
                  onClick={switchToDayView}
                  aria-pressed={activeView === 'day'}
                  className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 ${activeView === 'day'
                    ? 'bg-kanji-deep dark:bg-kio text-white dark:text-slate-900'
                    : 'text-kanji-deep dark:text-kio hover:bg-kio-light dark:hover:bg-slate-700'
                    }`}
                >
                  <Calendar size={15} aria-hidden="true" />
                  Día
                </button>
              </div>

              {/* Primary CTA — el hover es `kanji-deep/90` (5.8:1 con blanco),
                  igual que el CTA del shell en `DashboardLayout.tsx`. Con
                  `hover:bg-kanji` el fondo caía a #8a72d1 y el texto blanco a
                  3.88:1: DESIGN.md fija `kanji-deep` precisamente porque
                  `kanji` no aguanta texto normal encima, y el hover no está
                  exento de AA. */}
              <button
                type="button"
                onClick={handleNewAppointmentClick}
                data-tour="tour-schedule-btn"
                aria-label="Nueva cita"
                className="bg-kanji-deep hover:bg-kanji-deep/90 text-white px-5 min-h-11 rounded-[24px] text-sm font-bold shadow-sm transition-all duration-150 active:scale-95 flex items-center gap-2"
              >
                <Plus size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Nueva cita</span>
              </button>
            </div>
          </div>

          {/* Status Filters — fila propia y desplazable: bajo `lg` estaban
              ocultos, y con ellos desaparecían los contadores de citas. */}
          <div className="mt-3 -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto">
            <div className="flex w-max items-center gap-1 bg-surface dark:bg-slate-800 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-sm p-1">
              {STATUS_FILTERS.map((filter) => {
                const isActive = activeFilters.includes(filter.key);
                // Un chip ya puesto sigue siendo pulsable aunque el cruce sea
                // imposible: es la única forma de quitarlo.
                const isBlocked = !isActive && isStatusBlockedByPendingNotes(filter.key);
                const count = statusCounts[filter.key] ?? 0;
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => toggleFilter(filter.key)}
                    aria-pressed={isActive}
                    disabled={isBlocked}
                    aria-disabled={isBlocked}
                    className={`${CHIP_BASE} ${isBlocked ? CHIP_DISABLED : isActive ? CHIP_ACTIVE : CHIP_IDLE}`}
                  >
                    <Icon size={15} className={isBlocked ? 'text-gray-400 dark:text-slate-500' : filter.iconColor} aria-hidden="true" />
                    {filter.label}
                    {/* El contador solo aparece cuando el rango ya se conoce:
                        un "0" mientras carga o tras un error afirmaría que no
                        hay ninguna cita de ese estado. */}
                    {countsAreKnown && (
                      <span
                        className={`ml-0.5 min-w-[20px] px-1 h-[20px] flex items-center justify-center rounded-full text-[11px] font-bold leading-none ${isActive
                          ? 'bg-kanji/15 dark:bg-kio/20 text-kanji-deep dark:text-kio'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
                          }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}

              <span className="mx-1 h-6 w-px bg-gray-200 dark:bg-slate-700" aria-hidden="true" />

              {/* El grupo de estados solo sabe incluir, así que "ocultar
                  canceladas" era inexpresable — y es el filtro que un clínico
                  quiere de verdad. */}
              <button
                type="button"
                onClick={toggleHideCancelled}
                aria-pressed={hideCancelled}
                className={`${CHIP_BASE} ${hideCancelled ? CHIP_ACTIVE : CHIP_IDLE}`}
              >
                <EyeOff size={15} aria-hidden="true" />
                Ocultar canceladas
              </button>

              {pendingNotesOnly && (
                <button
                  type="button"
                  onClick={clearPendingNotesFilter}
                  aria-label="Quitar el filtro de notas pendientes"
                  className={`${CHIP_BASE} ${CHIP_ACTIVE}`}
                >
                  <FileClock size={15} aria-hidden="true" />
                  Solo notas pendientes
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Por qué "Agendadas" y "Canceladas" están apagados: el aviso lo dice
              en texto, no solo con el color del chip desactivado. */}
          {pendingNotesOnly && (
            <p className="mt-2 text-xs font-medium text-gray-600 dark:text-slate-400">
              El filtro de notas pendientes solo alcanza sesiones completadas: el resto de estados
              queda desactivado mientras esté puesto.
            </p>
          )}
        </div>

        {showEmptyNotice && (
          <p className="px-4 sm:px-6 py-2 text-xs font-medium text-gray-600 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800 bg-surface dark:bg-slate-900">
            {emptyNotice}
          </p>
        )}

        {/* Calendar Grid */}
        <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
          <div className="flex-1 min-w-0 h-full flex flex-col">
            {isError ? (
              /* El error va ANTES que cualquier lectura de la retícula: una
                 semana limpia y vacía ante un 500 afirma que no hay citas. */
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 border-t border-gray-200 dark:border-slate-800">
                <WidgetError
                  what="tu agenda"
                  onRetry={() => { void refetch(); }}
                  className="max-w-md"
                />
              </div>
            ) : isLoading ? (
              <CalendarGridSkeleton view={activeView} />
            ) : activeView === 'week' ? (
              <WeeklyCalendarGrid
                weekStart={currentWeekStart}
                appointments={filteredAppointments}
                onSelectAppointment={handleSelectAppointment}
                onSlotClick={handleSlotClick}
                onReschedule={handleReschedule}
                onQuickPay={handleQuickPay}
                onQuickReschedule={handleQuickReschedule}
              />
            ) : (
              <DailyCalendarGrid
                selectedDay={selectedDay}
                appointments={filteredAppointments}
                onSelectAppointment={handleSelectAppointment}
                onSlotClick={handleSlotClick}
                onReschedule={handleReschedule}
                onQuickPay={handleQuickPay}
                onQuickReschedule={handleQuickReschedule}
              />
            )}
          </div>
        </div>
      </div>

      {/* Appointment Detail Drawer */}
      <AppointmentDrawer
        appointment={selectedAppointment}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
      />

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        isOpen={!!scheduleSlot}
        onClose={handleCloseSchedule}
        initialDate={scheduleSlot}
      />

      {/* Quick Reschedule Modal */}
      <ScheduleAppointmentModal
        isOpen={!!rescheduleAppointmentInfo}
        onClose={() => setRescheduleAppointmentInfo(null)}
        initialDate={rescheduleAppointmentInfo ? parseISO(rescheduleAppointmentInfo.startTime.replace(' ', 'T')) : null}
        onConfirm={(newDate, duration) => {
          if (rescheduleAppointmentInfo) {
            handleReschedule(rescheduleAppointmentInfo.id, newDate, duration);
            setRescheduleAppointmentInfo(null);
          }
        }}
        isRescheduleMode={true}
      />

      {/* Quick Pay Modal */}
      <PaymentModal
        isOpen={!!paymentAppointment}
        onClose={() => setPaymentAppointment(null)}
        appointment={paymentAppointment}
        defaultStatus="PAID"
      />
    </DashboardLayout>
  );
}
