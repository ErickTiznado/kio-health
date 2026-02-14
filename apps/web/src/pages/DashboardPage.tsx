import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import { useDashboardData } from '../hooks/use-dashboard-data';
import { formatDateHeader, getGreeting } from '../lib/dashboard.helpers';
import { NextAppointmentWidget } from '../components/widgets/NextAppointmentWidget';
import { AvailabilityWidget } from '../components/widgets/AvailabilityWidget';
import { PendingNotesWidget } from '../components/widgets/PendingNotesWidget';
import { RecentPatientsWidget } from '../components/widgets/RecentPatientsWidget';
import { QuickActionsWidget } from '../components/widgets/QuickActionsWidget';

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
    isLoading,
  } = useDashboardData();

  const userName = user?.email?.split('@')[0] ?? 'Doctor';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-10 space-y-0">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
              {formatDateHeader()}
            </p>
            <h1 className="text-2xl font-bold text-kanji tracking-tight">
              {getGreeting()}, <span className="text-kio">{userName}</span>
            </h1>
          </div>
        </div>

        {/* LIQUID COMMAND DECK (Hero + Calendar + Attention) */}
        <div className="px-4 relative z-0">
          <div className="bg-gradient-to-br from-[#8a72d1] to-[#ae93fe] rounded-[40px] rounded-br-none relative">
            <div className="absolute inset-0 overflow-hidden rounded-[40px] rounded-br-none" />

            <div className="grid grid-cols-12 relative z-10">
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
            </div>
          </div>
        </div>

        {/* LOWER SECTION (Modular Grid) */}
        <div className="grid grid-cols-12 gap-6 px-4 mt-6 pb-10">
          <RecentPatientsWidget patients={recentPatients} />
          <QuickActionsWidget />
        </div>
      </div>
    </DashboardLayout>
  );
}