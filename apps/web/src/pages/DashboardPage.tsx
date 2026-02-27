import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import { useDashboardData } from '../hooks/use-dashboard-data';
import { formatDateHeader, getGreeting } from '../lib/dashboard.helpers';
import { NextAppointmentWidget } from '../components/widgets/NextAppointmentWidget';
import { AvailabilityWidget } from '../components/widgets/AvailabilityWidget';
import { PendingNotesWidget } from '../components/widgets/PendingNotesWidget';
import { RecentPatientsWidget } from '../components/widgets/RecentPatientsWidget';
import { TodayAgendaWidget } from '../components/widgets/TodayAgendaWidget';
import { useDocumentTitle } from '../hooks/use-document-title';

/**
 * Dashboard Page — Composition-only component.
 *
 * All data fetching and transformation lives in `useDashboardData`.
 * All presentational helpers live in `dashboard.helpers`.
 * This file only composes widgets (SRP).
 */
export function DashboardPage() {
  const { user } = useAuthStore();
  const {
    nextAppointment,
    recentPatients,
    calendarDays,
    pendingNotesCount,
    todayAppointments,
    isLoading,
    isTodayLoading,
  } = useDashboardData();

  const userName = user?.email?.split('@')[0] ?? 'Doctor';

  const titleLabel =
    todayAppointments.length > 0
      ? `Kio (${todayAppointments.length} ${todayAppointments.length === 1 ? 'Cita' : 'Citas'})`
      : 'Dashboard';
  useDocumentTitle(titleLabel);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-10 space-y-0">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
              {formatDateHeader()}
            </p>
            <h1 className="text-2xl font-bold text-kanji dark:text-white tracking-tight">
              {getGreeting()}, <span className="text-kio">{userName}</span>
            </h1>
          </div>
        </div>

        {/* LIQUID COMMAND DECK (Hero + Calendar + Attention) */}
        <div className="px-4 relative z-0">
          <div className="bg-surface dark:bg-slate-900 rounded-[40px] rounded-br-none relative overflow-hidden transition-colors duration-200">
            {/* Liquid Fill Animation */}
            <motion.div
              initial={{ height: "0%" }}
              animate={{ height: "100%" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} // Fluid "Quart out"
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-br from-[#8a72d1] to-[#ae93fe] z-0"
            />

            {/* Content Layer - Delayed Fade In */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-12 relative z-10"
            >
              {/* HERO (8/12) */}
              <NextAppointmentWidget
                appointment={nextAppointment}
                isLoading={isLoading}
              />

              {/* CALENDAR & ATTENTION (4/12) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col">
                <AvailabilityWidget days={calendarDays} />
                <PendingNotesWidget count={pendingNotesCount} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="grid grid-cols-12 gap-4 xl:gap-6 px-4 mt-6 pb-10">
          <RecentPatientsWidget patients={recentPatients} />

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 xl:gap-6 h-full">
            <div className="flex-1 min-h-0">
              <TodayAgendaWidget appointments={todayAppointments} isLoading={isTodayLoading} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}