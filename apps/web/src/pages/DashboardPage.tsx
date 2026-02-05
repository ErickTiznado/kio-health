import { useQuery } from '@tanstack/react-query';
import {
  UserPlus,
  CalendarPlus,
  Play,
  History,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import { Skeleton } from '../components/ui/Skeleton';
import { fetchAppointmentsByDate, getTodayDateString } from '../lib/appointments.api';
import type { Appointment } from '../types/appointments.types';

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
  
  const calendarDays = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    density: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'free'
  }));

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
<div className="bg-gradient-to-br from-[#8a72d1] to-[#ae93fe] rounded-[40px] rounded-br-none overflow-hidden relative">            {/* Texture Blobs */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-12 relative z-10">
              
              {/* COLUMNA HERO (8/12) */}
              <div className="col-span-12 lg:col-span-8 p-10 lg:p-14 text-white">
                {isLoading ? (
                  <Skeleton className="w-64 h-12 bg-white/20" />
                ) : nextAppointment ? (
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-white/10">
                       <Clock size={12} /> EN CURSO
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter leading-none">
                      {nextAppointment.patient.fullName.split(' ')[0]}
                      <span className="block text-3xl font-light opacity-60 mt-2">
                        {nextAppointment.patient.fullName.split(' ').slice(1).join(' ')}
                      </span>
                    </h2>
                    <button className="bg-white text-kio px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-transform">
                      <Play fill="currentColor" size={16} /> Iniciar Consulta
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                       <Sparkles size={32} />
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter">Todo listo.</h2>
                    <p className="text-purple-100 text-lg opacity-80">No hay más citas programadas por hoy.</p>
                  </div>
                )}
              </div>

              {/* COLUMNA CALENDARIO & ATENCIÓN (4/12) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col">
                  
                  {/* CALENDAR */}
                  <div className="flex-1 p-8 lg:p-10 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6 text-white/90">
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Disponibilidad</h3>
                      <MoreHorizontal size={18} className="opacity-40" />
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                      {['L','M','M','J','V','S','D'].map(d => (
                         <div key={d} className="text-center text-[10px] font-bold text-white/30">{d}</div>
                      ))}
                      {calendarDays.slice(0, 28).map((d, i) => (
                         <div key={i} className={`aspect-square rounded-full flex items-center justify-center text-[9px] font-bold ${d.density === 'high' ? 'bg-white text-kio' : 'bg-white/5 text-white/20'}`}>
                            {d.density === 'high' && <div className="w-1 h-1 rounded-full bg-kio"></div>}
                         </div>
                      ))}
                    </div>
                  </div>

                  {/* ATENCIÓN CARD (Integrated) */}
                  <div className="p-6 bg-white padding-2 rounded-[40px] rounded-br-none rounded-bl-none rounded-tr-none">
                        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 relative overflow-hidden flex flex-col justify-between h-full shadow-[10px_10px_20px_0_rgba(0,0,0,0.1)]">
  
  {/* 1. Encabezado: Título y Subtítulo + Icono Flotante */}
  <div className="flex justify-between items-start z-10 relative">
    <div>
       <h3 className="text-amber-950 font-bold text-sm">Notas Pendientes</h3>
       <p className="text-amber-700/60 text-[10px] font-medium mt-1">Requieren tu revisión</p>
    </div>
    
    {/* Icono en círculo blanco para resaltar sobre el crema */}
    <div className="p-2 bg-white rounded-full text-amber-500 shadow-sm border border-amber-50">
       <AlertCircle size={18} />
    </div>
  </div>

  {/* 2. Cuerpo: Número Gigante y Botón de Acción */}
  <div className="flex items-end justify-between mt-6 z-10 relative">
     {/* Número grande alineado a la base */}
     <span className="text-6xl font-black text-amber-950 tracking-tighter leading-none -ml-1">
       3
     </span>
     
     {/* Botón adaptado al tema: Blanco con texto oscuro para contraste limpio */}
     <button className="bg-white text-amber-950 py-2.5 px-5 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm border border-amber-100 hover:bg-amber-100 hover:scale-105 transition-all flex items-center gap-2">
       Resolver <ArrowRight size={12} />
     </button>
  </div>

  {/* 3. Decoración de fondo (Opcional, para profundidad) */}
  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"></div>
</div>  

                  </div>

              </div>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN INFERIOR (Modular Grid) --- */}
        <div className="grid grid-cols-12 gap-6 px-4 mt-6 pb-10">
            
            {/* PACIENTES RECIENTES (8/12) */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-sm border border-gray-100 h-full">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                      <History size={24} className="text-gray-300" /> Vistos Recientemente
                    </h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentPatients.map((p) => (
                      <div key={p.id} className="p-5 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group border border-transparent hover:border-gray-200">
                         <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${p.color}`}>{p.name[0]}</div>
                            <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-full">{p.time}</span>
                         </div>
                         <div>
                            <p className="font-bold text-gray-900 mb-1 group-hover:text-kanji transition-colors">{p.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{p.reason}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* QUICK ACTIONS (4/12) - Vertical Pills */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
               <button className="w-full bg-white p-4 h-[72px] rounded-2xl border border-gray-100 flex items-center gap-4 text-gray-500 hover:text-kio hover:border-kio hover:bg-purple-50 transition-all shadow-sm group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                     <UserPlus size={20} className="group-hover:text-kio" />
                  </div>
                  <div className="flex flex-col items-start">
                     <span className="text-sm font-black uppercase text-gray-800 group-hover:text-kio">Nuevo Paciente</span>
                     <span className="text-[10px] font-medium text-gray-400">Registrar ingreso</span>
                  </div>
               </button>

               <button className="w-full bg-white p-4 h-[72px] rounded-2xl border border-gray-100 flex items-center gap-4 text-gray-500 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                     <CalendarPlus size={20} className="group-hover:text-emerald-600" />
                  </div>
                  <div className="flex flex-col items-start">
                     <span className="text-sm font-black uppercase text-gray-800 group-hover:text-emerald-700">Agendar Cita</span>
                     <span className="text-[10px] font-medium text-gray-400">Programar sesión</span>
                  </div>
               </button>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}