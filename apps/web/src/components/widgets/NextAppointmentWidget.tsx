import { useState, useEffect } from 'react';
import { Clock, Play, UserPlus, Brain, Calendar, Hash, Radio, FileText } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import type { Appointment } from '../../types/appointments.types';

interface NextAppointmentProps {
  appointment: Appointment | null;
  isLoading: boolean;
}

/* ── Pure helpers ──────────────────────────────── */

function computeAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function isInProgress(appointment: Appointment): boolean {
  const now = Date.now();
  return (
    new Date(appointment.startTime).getTime() <= now &&
    new Date(appointment.endTime).getTime() > now
  );
}

function formatElapsed(startIso: string): string {
  const diff = Date.now() - new Date(startIso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Recién iniciada';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function formatCountdown(startIso: string): string {
  const diff = new Date(startIso).getTime() - Date.now();
  if (diff <= 0) return 'Ahora';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `en ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (remainMins === 0) return `en ${hrs}h`;
  return `en ${hrs}h ${remainMins}m`;
}

/* ── Shared sub-components ────────────────────── */

function PatientHeader({ appointment }: { appointment: Appointment }) {
  return (
    <div>
      <h2 className="text-5xl font-black tracking-tighter leading-none">
        {appointment.patient.fullName.split(' ')[0]}
        <span className="block text-2xl font-light opacity-60 mt-1">
          {appointment.patient.fullName.split(' ').slice(1).join(' ')}
          {appointment.patient.dateOfBirth && (
            <span className="ml-2 text-lg opacity-80">
              · {computeAge(appointment.patient.dateOfBirth)} años
            </span>
          )}
        </span>
      </h2>
    </div>
  );
}

function DiagnosisTags({ appointment }: { appointment: Appointment }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {appointment.patient.diagnosis && (
        <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white/90 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10">
          <Brain size={12} className="opacity-70" />
          {appointment.patient.diagnosis}
        </span>
      )}
      {appointment.reason && (
        <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/70 px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10">
          <Calendar size={12} className="opacity-60" />
          {appointment.reason}
        </span>
      )}
    </div>
  );
}

/* ── In-Progress State ────────────────────────── */

function InProgressView({ appointment }: { appointment: Appointment }) {
  const [elapsed, setElapsed] = useState(() => formatElapsed(appointment.startTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsed(appointment.startTime));
    }, 30_000); // Update every 30s
    return () => clearInterval(interval);
  }, [appointment.startTime]);

  return (
    <div className="space-y-5 relative z-10">
      {/* Status badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 bg-emerald-400/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-emerald-400/30 text-emerald-100">
          <Radio size={10} className="animate-pulse" /> EN CURSO
        </span>
        <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-white/10">
          <Clock size={10} /> {elapsed}
        </span>
        {appointment.sessionNumber && (
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-white/10">
            <Hash size={10} /> SESIÓN {appointment.sessionNumber}
          </span>
        )}
      </div>

      <PatientHeader appointment={appointment} />
      <DiagnosisTags appointment={appointment} />

      {/* Clinical context */}
      {appointment.patient.clinicalContext && (
        <p className="text-sm text-purple-100/70 max-w-lg leading-relaxed line-clamp-2">
          {appointment.patient.clinicalContext}
        </p>
      )}

      {/* Actions — contextual for in-progress */}
      <div className="flex items-center gap-3 mt-2">
        <button className="bg-white text-kio px-6 py-3.5 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-transform text-sm">
          <FileText size={16} /> Escribir Nota
        </button>
        <button className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all text-sm">
          <Clock size={14} /> Finalizar Sesión
        </button>
      </div>
    </div>
  );
}

/* ── Upcoming State ───────────────────────────── */

function UpcomingView({ appointment }: { appointment: Appointment }) {
  const [countdown, setCountdown] = useState(() => formatCountdown(appointment.startTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(appointment.startTime));
    }, 30_000);
    return () => clearInterval(interval);
  }, [appointment.startTime]);

  return (
    <div className="space-y-5 relative z-10">
      {/* Status badges */}
      <div className="flex items-center gap-3 flex-wrap">
        {appointment.sessionNumber && (
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-white/10">
            <Hash size={10} /> SESIÓN {appointment.sessionNumber}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-white/10">
          <Clock size={10} /> {formatTime(appointment.startTime)} · {countdown}
        </span>
      </div>

      <PatientHeader appointment={appointment} />
      <DiagnosisTags appointment={appointment} />

      {/* Clinical context */}
      {appointment.patient.clinicalContext && (
        <p className="text-sm text-purple-100/70 max-w-lg leading-relaxed line-clamp-2">
          {appointment.patient.clinicalContext}
        </p>
      )}

      {/* Action */}
      <button className="bg-white text-kio px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-transform mt-2">
        <Play fill="currentColor" size={16} /> Iniciar Consulta
      </button>
    </div>
  );
}

/* ── Empty State ──────────────────────────────── */

function EmptyView() {
  return (
    <div className="relative z-10 h-full flex flex-col justify-center">
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
  );
}

/* ── Main Widget ──────────────────────────────── */

export function NextAppointmentWidget({ appointment, isLoading }: NextAppointmentProps) {
  const inProgress = appointment ? isInProgress(appointment) : false;

  return (
    <div className="col-span-12 lg:col-span-8 p-10 lg:p-14 text-white relative overflow-hidden">
      {isLoading ? (
        <Skeleton className="w-64 h-12 bg-white/20" />
      ) : appointment ? (
        inProgress ? (
          <InProgressView appointment={appointment} />
        ) : (
          <UpcomingView appointment={appointment} />
        )
      ) : (
        <EmptyView />
      )}
    </div>
  );
}
