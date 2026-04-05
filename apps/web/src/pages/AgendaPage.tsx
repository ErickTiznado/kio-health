import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfWeek, addWeeks, subWeeks, addDays, subDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Loader2, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { useIsMobile } from '../hooks/use-is-mobile';
import { DashboardLayout } from '../components/DashboardLayout';
import { WeeklyCalendarGrid } from '../features/calendar/components/WeeklyCalendarGrid';
import { DailyCalendarGrid } from '../features/calendar/components/DailyCalendarGrid';
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
  const queryClient = useQueryClient();


  /* ── Data fetching ── */

  const weekStart = activeView === 'day'
    ? startOfWeek(selectedDay, { weekStartsOn: 1 })
    : currentWeekStart;

  const weekEnd = addDays(weekStart, 6);
  const fromStr = format(weekStart, 'yyyy-MM-dd');
  const toStr = format(weekEnd, 'yyyy-MM-dd');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', 'range', fromStr, toStr],
    queryFn: () => fetchAppointmentsByRange(fromStr, toStr),
    staleTime: 1000 * 60 * 2,
  });

  /* ── Filter Logic ── */

  const toggleFilter = useCallback((filterKey: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((k) => k !== filterKey)
        : [...prev, filterKey]
    );
  }, []);

  const filteredAppointments = useMemo(() => {
    if (activeFilters.length === 0) return appointments;

    return appointments.filter((apt) => activeFilters.includes(apt.status));
  }, [appointments, activeFilters]);

  /* ── Mobile Logic ── */
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      const id = setTimeout(() => {
        setActiveView('day');
        setSelectedDay(new Date());
      }, 0);
      return () => clearTimeout(id);
    }
  }, [isMobile]);

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
    setSelectedDay(new Date());
  }, []);

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

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] -m-4 sm:-m-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 pt-4 pb-3 border-b border-gray-200 dark:border-slate-800 bg-surface dark:bg-slate-900 sticky  z-30">
          <div>
            <h1 className="text-2xl font-bold text-kanji dark:text-kio tracking-tight">Mi Agenda</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 opacity-60 mt-0.5 capitalize">{dateLabel}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filters */}
            <div className="hidden lg:flex items-center bg-surface dark:bg-slate-800 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-sm p-1 mr-1">
              {[
                { key: 'COMPLETED', label: 'Completada', icon: CheckCircle2, iconColor: 'text-emerald-500', activeBg: 'bg-kanji/10 dark:bg-kio/10', activeBorder: 'ring-kanji/30 dark:ring-kio/30' },
                { key: 'SCHEDULED', label: 'Agendada', icon: Calendar, iconColor: 'text-blue-500', activeBg: 'bg-kanji/10 dark:bg-kio/10', activeBorder: 'ring-kanji/30 dark:ring-kio/30' },
                { key: 'CANCELLED', label: 'Cancelada', icon: XCircle, iconColor: 'text-red-500', activeBg: 'bg-kanji/10 dark:bg-kio/10', activeBorder: 'ring-kanji/30 dark:ring-kio/30' },
              ].map((filter) => {
                const isActive = activeFilters.includes(filter.key);
                const count = appointments.filter((a) => a.status === filter.key).length;
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.key}
                    onClick={() => toggleFilter(filter.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${isActive
                      ? `${filter.activeBg} text-kanji dark:text-kio ring-1 ${filter.activeBorder} shadow-sm`
                      : 'text-kanji/60 dark:text-kio/60 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-kanji dark:hover:text-kio'
                      }`}
                  >
                    <Icon size={13} className={filter.iconColor} />
                    {filter.label}
                    {count > 0 && (
                      <span className={`ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-black leading-none ${isActive
                        ? 'bg-kanji/15 dark:bg-kio/20 text-kanji dark:text-kio'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400'
                        }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <Loader2 size={16} className="animate-spin text-kanji dark:text-kio opacity-60" />
            )}

            {/* Navigation */}
            <div className="flex items-center gap-1 bg-surface dark:bg-slate-800 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-sm p-1">
              <button
                type="button"
                onClick={navigatePrevious}
                className="p-2 rounded-xl hover:bg-kio-light dark:hover:bg-slate-700 text-kanji dark:text-kio transition-all"
                aria-label={previousAriaLabel}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={navigateToToday}
                className="px-4 py-2 rounded-xl text-xs font-bold text-kanji dark:text-kio hover:bg-kio-light dark:hover:bg-slate-700 transition-colors"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={navigateNext}
                className="p-2 rounded-xl hover:bg-kio-light dark:hover:bg-slate-700 text-kanji dark:text-kio transition-all"
                aria-label={nextAriaLabel}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View Toggle */}
            {!isMobile && (
              <div className="flex items-center bg-surface dark:bg-slate-800 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-sm p-1">
                <button
                  type="button"
                  onClick={switchToWeekView}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${activeView === 'week'
                    ? 'bg-kanji dark:bg-kio text-white dark:text-slate-900 shadow-sm'
                    : 'text-kanji dark:text-kio hover:bg-kio-light dark:hover:bg-slate-700'
                    }`}
                >
                  <CalendarDays size={14} />
                  Semana
                </button>
                <button
                  type="button"
                  onClick={switchToDayView}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${activeView === 'day'
                    ? 'bg-kanji dark:bg-kio text-white dark:text-slate-900 shadow-sm'
                    : 'text-kanji dark:text-kio hover:bg-kio-light dark:hover:bg-slate-700'
                    }`}
                >
                  <Calendar size={14} />
                  Día
                </button>
              </div>
            )}

            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleNewAppointmentClick}
              data-tour="tour-schedule-btn"
              className="bg-kio hover:bg-kanji text-white px-5 py-2.5 rounded-[24px] text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 ml-1"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nueva Cita</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid & Sidebar */}
        <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
          <div className="flex-1 min-w-0 h-full flex flex-col">
            {activeView === 'week' ? (
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
