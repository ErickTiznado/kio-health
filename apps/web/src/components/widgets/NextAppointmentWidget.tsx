import { Clock, Play, UserPlus } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import type { Appointment } from '../../types/appointments.types';

interface NextAppointmentProps {
  appointment: Appointment | null;
  isLoading: boolean;
}

export function NextAppointmentWidget({ appointment, isLoading }: NextAppointmentProps) {
  return (
    <div className="col-span-12 lg:col-span-8 p-10 lg:p-14 text-white relative overflow-hidden">
      {isLoading ? (
        <Skeleton className="w-64 h-12 bg-white/20" />
      ) : appointment ? (
        <div className="space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-white/10">
             <Clock size={12} /> EN CURSO
          </div>
          <h2 className="text-6xl font-black tracking-tighter leading-none">
            {appointment.patient.fullName.split(' ')[0]}
            <span className="block text-3xl font-light opacity-60 mt-2">
              {appointment.patient.fullName.split(' ').slice(1).join(' ')}
            </span>
          </h2>
          <button className="bg-white text-kio px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-transform">
            <Play fill="currentColor" size={16} /> Iniciar Consulta
          </button>
        </div>
      ) : (
        <div className="relative z-10 h-full flex flex-col justify-center">
            {/* Background Radar Waves (Abstract) */}
            <div className="absolute -right-20 -top-20 w-96 h-96 border border-white/5 rounded-full pointer-events-none" />
            <div className="absolute -right-10 -top-10 w-64 h-64 border border-white/5 rounded-full pointer-events-none" />

            <h2 className="text-6xl font-black tracking-tighter mb-4">Agenda despejada.</h2>
            <p className="text-purple-100/80 text-lg max-w-md mb-8 leading-relaxed">
              No tienes citas digitales programadas por ahora. Tienes disponibilidad total para atender pacientes presenciales o urgencias.
            </p>
            <button className="bg-white text-kanji px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-transform w-fit">
               <UserPlus size={20} /> Registrar Visita
            </button>
        </div>
      )}
    </div>
  );
}
