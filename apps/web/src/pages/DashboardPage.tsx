import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import { fetchAppointmentsByDate, getTodayDateString } from '../lib/appointments.api';
import type { Appointment } from '../types/appointments.types';
import { NextAppointmentWidget } from '../components/widgets/NextAppointmentWidget';
import { AvailabilityWidget } from '../components/widgets/AvailabilityWidget';
import { PendingNotesWidget } from '../components/widgets/PendingNotesWidget';
import { RecentPatientsWidget } from '../components/widgets/RecentPatientsWidget';
import { QuickActionsWidget } from '../components/widgets/QuickActionsWidget';

function formatDateHeader(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function getNextAppointment(appointments: Appointment[] | undefined): Appointment | null {
  if (!appointments || appointments.length === 0) return null;
  const now = new Date();
  const sorted = [...appointments].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  return sorted.find(app => new Date(app.endTime).getTime() > now.getTime()) || null;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const today = getTodayDateString();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', today],
    queryFn: () => fetchAppointmentsByDate(today),
    staleTime: 1000 * 60 * 5,
  });

  const userName = user?.email?.split('@')[0] || 'Doctor';
  const nextAppointment = getNextAppointment(appointments);
  
  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const rand = Math.random();
    let density = 'free';
    let status = 'Disponible';
    let freeHours = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'];

    if (rand > 0.85) {
      density = 'full';
      status = 'Lleno';
      freeHours = [];
    } else if (rand > 0.6) {
      density = 'high';
      status = 'Casi lleno';
      freeHours = ['17:00'];
    } else if (rand > 0.4) {
      density = 'medium';
      status = 'Demanda media';
      freeHours = ['11:00', '16:00', '17:00'];
    } else if (rand > 0.2) {
      density = 'low';
      status = 'Poca demanda';
      freeHours = ['10:00', '11:00', '16:00', '17:00'];
    }
    
    return { day: i + 1, density, status, freeHours };
  });

  const recentPatients = [
    { id: '1', name: 'Ana García', reason: 'Ansiedad Generalizada', time: '10:30 AM', color: 'bg-rose-100 text-rose-600' },
    { id: '2', name: 'Carlos Ruiz', reason: 'Terapia de Pareja', time: 'Ayer', color: 'bg-blue-100 text-blue-600' },
    { id: '3', name: 'Lucía Méndez', reason: 'Control de Estrés', time: 'Ayer', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-10 space-y-0">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{formatDateHeader()}</p>
              <h1 className="text-2xl font-bold text-kanji tracking-tight">
                 {getGreeting()}, <span className="text-kio">{userName}</span>
              </h1>
           </div>
        </div>

        {/* --- LIQUID COMMAND DECK (Hero + Calendar + Attention) --- */}
        <div className="px-4 relative z-0">
          <div className="bg-gradient-to-br from-[#8a72d1] to-[#ae93fe] rounded-[40px] rounded-br-none relative">
            {/* Texture Blobs Container (Overflow Hidden) */}
            <div className="absolute inset-0 overflow-hidden rounded-[40px] rounded-br-none">
              {/* Removed white reflection blob */}
            </div>

            <div className="grid grid-cols-12 relative z-10">
              
              {/* COLUMNA HERO (8/12) */}
              <NextAppointmentWidget appointment={nextAppointment} isLoading={isLoading} />

              {/* COLUMNA CALENDARIO & ATENCIÓN (4/12) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col">
                  
                  {/* CALENDAR */}
                  <AvailabilityWidget days={calendarDays} />

                  {/* ATENCIÓN CARD (Integrated) */}
                  <PendingNotesWidget count={3} />

              </div>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN INFERIOR (Modular Grid) --- */}
        <div className="grid grid-cols-12 gap-6 px-4 mt-6 pb-10">
            
            {/* PACIENTES RECIENTES (8/12) */}
            <RecentPatientsWidget patients={recentPatients} />

            {/* QUICK ACTIONS (4/12) - Vertical Pills */}
            <QuickActionsWidget />
        </div>
      </div>
    </DashboardLayout>
  );
}