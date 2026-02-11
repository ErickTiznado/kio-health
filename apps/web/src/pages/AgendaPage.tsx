import { useState, useMemo, useCallback } from 'react';
import { startOfWeek, addWeeks, subWeeks, addDays, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { WeeklyCalendarGrid } from '../components/agenda/WeeklyCalendarGrid';
import { DailyCalendarGrid } from '../components/agenda/DailyCalendarGrid';
import { AppointmentDrawer } from '../components/agenda/AppointmentDrawer';
import { generateWeeklyAppointments } from '../lib/agenda.mock';
import type { AgendaAppointment } from '../types/agenda.types';
import type { CalendarView } from '../types/agenda.types';

/**
 * Agenda Page — Interactive weekly/daily calendar view.
 * Uses DashboardLayout with navigation controls that adapt to the active view.
 */
export function AgendaPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [activeView, setActiveView] = useState<CalendarView>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<AgendaAppointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const appointments = useMemo(
    () => generateWeeklyAppointments(activeView === 'day' ? startOfWeek(selectedDay, { weekStartsOn: 1 }) : currentWeekStart),
    [currentWeekStart, selectedDay, activeView]
  );

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
    // Sync week start from selected day
    setCurrentWeekStart(startOfWeek(selectedDay, { weekStartsOn: 1 }));
  }, [selectedDay]);

  const switchToDayView = useCallback(() => {
    setActiveView('day');
    setSelectedDay(new Date());
  }, []);

  /* ── Drawer handlers ── */

  const handleSelectAppointment = useCallback((appointment: AgendaAppointment) => {
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 pt-4 pb-3">
          <div>
            <h1 className="text-2xl font-bold text-kanji tracking-tight">Mi Agenda</h1>
            <p className="text-sm text-gray-400 mt-0.5 capitalize">{dateLabel}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation */}
            <div className="flex items-center gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
              <button
                type="button"
                onClick={navigatePrevious}
                className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-kanji transition-colors"
                aria-label={previousAriaLabel}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={navigateToToday}
                className="px-4 py-2 rounded-xl text-xs font-bold text-kanji hover:bg-kio-light transition-colors"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={navigateNext}
                className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-kanji transition-colors"
                aria-label={nextAriaLabel}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
              <button
                type="button"
                onClick={switchToWeekView}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeView === 'week'
                    ? 'bg-kanji text-white shadow-sm'
                    : 'text-gray-500 hover:text-kanji'
                }`}
              >
                <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" />
                Semana
              </button>
              <button
                type="button"
                onClick={switchToDayView}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeView === 'day'
                    ? 'bg-kanji text-white shadow-sm'
                    : 'text-gray-500 hover:text-kanji'
                }`}
              >
                <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
                Día
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid — fills remaining height */}
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
