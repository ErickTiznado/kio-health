import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfWeek, addWeeks, subWeeks, addDays, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Loader2, Plus, CheckCircle2, XCircle, Banknote } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { WeeklyCalendarGrid } from '../components/agenda/WeeklyCalendarGrid';
import { DailyCalendarGrid } from '../components/agenda/DailyCalendarGrid';
import { AppointmentDrawer } from '../components/agenda/AppointmentDrawer';
import { fetchAppointmentsByRange } from '../lib/appointments.api';
import type { Appointment } from '../types/appointments.types';
import type { CalendarView } from '../types/agenda.types';

/**
 * Agenda Page — Interactive weekly/daily calendar view.
 * Fetches real appointments from the backend API for the visible date range.
 */
export function AgendaPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [activeView, setActiveView] = useState<CalendarView>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 pt-4 pb-3 border-b border-[var(--color-cruz)] bg-white/50 backdrop-blur-sm sticky  z-30">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-kanji)] tracking-tight">Mi Agenda</h1>
            <p className="text-sm text-[var(--color-text)] opacity-60 mt-0.5 capitalize">{dateLabel}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend - Using Icons instead of Emojis/Dots */}
            <div className="hidden xl:flex items-center gap-4 mr-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-200 pr-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" /> Completada
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-blue-500" /> Agendada
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={12} className="text-red-500" /> Cancelada
              </div>
              <div className="flex items-center gap-1.5">
                <Banknote size={12} className="text-amber-500" /> Deuda
              </div>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <Loader2 size={16} className="animate-spin text-[var(--color-kanji)] opacity-60" />
            )}

            {/* Navigation */}
            <div className="flex items-center gap-1 bg-white rounded-[24px] border border-[var(--color-cruz)] shadow-sm p-1">
              <button
                type="button"
                onClick={navigatePrevious}
                className="p-2 rounded-xl hover:bg-[var(--color-bg)] text-[var(--color-text)] opacity-70 hover:opacity-100 hover:text-[var(--color-kanji)] transition-all"
                aria-label={previousAriaLabel}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={navigateToToday}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-kanji)] hover:bg-[var(--color-kio-light)] transition-colors"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={navigateNext}
                className="p-2 rounded-xl hover:bg-[var(--color-bg)] text-[var(--color-text)] opacity-70 hover:opacity-100 hover:text-[var(--color-kanji)] transition-all"
                aria-label={nextAriaLabel}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-white rounded-[24px] border border-[var(--color-cruz)] shadow-sm p-1">
              <button
                type="button"
                onClick={switchToWeekView}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${activeView === 'week'
                  ? 'bg-[var(--color-kanji)] text-white shadow-sm'
                  : 'text-[var(--color-text)] opacity-70 hover:text-[var(--color-kanji)] hover:opacity-100'
                  }`}
              >
                <CalendarDays size={14} />
                Semana
              </button>
              <button
                type="button"
                onClick={switchToDayView}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${activeView === 'day'
                  ? 'bg-[var(--color-kanji)] text-white shadow-sm'
                  : 'text-[var(--color-text)] opacity-70 hover:text-[var(--color-kanji)] hover:opacity-100'
                  }`}
              >
                <Calendar size={14} />
                Día
              </button>
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              className="bg-kio hover:bg-kanji text-white px-5 py-2.5 rounded-[24px] text-sm font-bold shadow-lg shadow-kio/20 transition-all active:scale-95 flex items-center gap-2 ml-1"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nueva Cita</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 min-h-0">
          {activeView === 'week' ? (
            <WeeklyCalendarGrid
              weekStart={currentWeekStart}
              appointments={appointments}
              onSelectAppointment={handleSelectAppointment}
            />
          ) : (
            <DailyCalendarGrid
              selectedDay={selectedDay}
              appointments={appointments}
              onSelectAppointment={handleSelectAppointment}
            />
          )}
        </div>
      </div>

      {/* Appointment Detail Drawer */}
      <AppointmentDrawer
        appointment={selectedAppointment}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </DashboardLayout>
  );
}
