import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, UserPlus, Brain, Calendar, Hash, Radio, FileText, Eye, EyeOff } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@repo/ui/skeleton';
import type { Appointment } from '../../types/appointments.types';
import { WidgetError } from './WidgetError';

interface NextAppointmentProps {
  appointment: Appointment | null;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
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

/**
 * Un solo reloj en todo el dashboard.
 *
 * Esto fijaba `es-MX` con `hour12` ("2:00 p.m.") mientras la sección HOY, a
 * doce píxeles de distancia, formatea la misma cita con `HH:mm` ("14:00"). Se
 * unifica en 24h, que es el formato de la lista y el que no obliga a leer un
 * sufijo para saber la hora.
 */
function formatTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm');
}

function formatScheduledDate(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return `hoy a las ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `mañana a las ${format(date, 'HH:mm')}`;
  return format(date, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es });
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

/**
 * Chip de la banda. Sobre la rampa de marca el fondo se OSCURECE, nunca se
 * aclara: `bg-white/15` sobre el degradado baja el texto blanco por debajo de
 * AA en todo el recorrido. Ver DESIGN.md → el deck del dashboard.
 */
function BandChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
      {children}
    </span>
  );
}

/**
 * Nombre del paciente.
 *
 * Antes ocupaba `text-5xl` en un panel de 12rem de alto: la mitad del espacio
 * muerto del dashboard salía de aquí. La banda ahora se dimensiona por su
 * contenido, y el nombre pesa por contraste con la fila, no por tamaño bruto.
 *
 * El nombre va entero a un solo peso. Partirlo en nombre `font-bold` y apellido
 * `font-medium`, ambos en blanco puro, no producía la jerarquía que buscaba:
 * a `text-3xl` la diferencia entre 500 y 700 es casi invisible y el único
 * contraste disponible — el color — era idéntico en las dos mitades. La
 * jerarquía real la hace la edad, que sí baja de tamaño.
 */
function PatientHeader({ appointment }: { appointment: Appointment }) {
  return (
    <h3 className="text-2xl font-bold leading-tight tracking-tight text-white lg:text-3xl">
      {appointment.patient.fullName}
      {appointment.patient.dateOfBirth && (
        <span className="ml-2 text-base font-medium text-white">
          · {computeAge(appointment.patient.dateOfBirth)} años
        </span>
      )}
    </h3>
  );
}

/**
 * Contexto clínico, tras una revelación explícita.
 *
 * `diagnosis` y `clinicalContext` son dos de los seis campos cifrados en
 * reposo. Renderizarlos por defecto los ponía en el elemento más grande de la
 * pantalla principal — la que queda abierta mientras el paciente entra a la
 * sala. El clínico ya conoce el diagnóstico; la única persona para quien ese
 * texto es nuevo es quien pasa junto al escritorio.
 */
function ClinicalContext({ appointment }: { appointment: Appointment }) {
  const [revealed, setRevealed] = useState(false);
  const { diagnosis, clinicalContext } = appointment.patient;

  if (!diagnosis && !clinicalContext && !appointment.reason) return null;

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-black/25 px-3 text-xs font-bold text-white transition-colors hover:bg-black/40"
      >
        <Eye size={14} aria-hidden="true" /> Ver contexto clínico
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {diagnosis && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/30 px-3 py-1.5 text-xs font-bold text-white">
            <Brain size={12} aria-hidden="true" />
            {diagnosis}
          </span>
        )}
        {appointment.reason && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/25 px-3 py-1.5 text-xs font-medium text-white">
            <Calendar size={12} aria-hidden="true" />
            {appointment.reason}
          </span>
        )}
        <button
          type="button"
          onClick={() => setRevealed(false)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-white transition-colors hover:bg-black/25"
        >
          <EyeOff size={14} aria-hidden="true" /> Ocultar
        </button>
      </div>
      {clinicalContext && (
        <p className="max-w-prose text-sm font-medium leading-relaxed text-white">
          {clinicalContext}
        </p>
      )}
    </div>
  );
}

/**
 * Cuerpo de la banda: chips + nombre + contexto a la izquierda, acción primaria
 * a la derecha en LA MISMA fila. Antes la acción caía debajo de un bloque de
 * 5rem de tipografía y quedaba a media pantalla de distancia del dato que la
 * justifica.
 */
function Band({
  chips,
  appointment,
  action,
}: {
  chips: React.ReactNode;
  appointment: Appointment;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">{chips}</div>
        <PatientHeader appointment={appointment} />
        <ClinicalContext appointment={appointment} />
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/* ── In-Progress State ────────────────────────── */

function InProgressView({ appointment }: { appointment: Appointment }) {
  const [elapsed, setElapsed] = useState(() => formatElapsed(appointment.startTime));
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsed(appointment.startTime));
    }, 30_000);
    return () => clearInterval(interval);
  }, [appointment.startTime]);

  return (
    <Band
      appointment={appointment}
      chips={
        <>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950/50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-100">
            <Radio size={10} className="animate-pulse" aria-hidden="true" /> En curso
          </span>
          <BandChip>
            <Clock size={10} aria-hidden="true" /> {elapsed}
          </BandChip>
          {appointment.sessionNumber && (
            <BandChip>
              <Hash size={10} aria-hidden="true" /> Sesión {appointment.sessionNumber}
            </BandChip>
          )}
        </>
      }
      action={
        <button
          type="button"
          onClick={() => navigate(`/session/${appointment.id}`)}
          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-white px-6 text-sm font-bold text-kanji-deep transition-all duration-150 hover:bg-cruz active:scale-95 lg:w-auto"
        >
          <FileText size={16} aria-hidden="true" /> Ir a la sesión
        </button>
      }
    />
  );
}

/* ── Upcoming State ───────────────────────────── */

function UpcomingView({ appointment }: { appointment: Appointment }) {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => Date.now());
  const [countdown, setCountdown] = useState(() => formatCountdown(appointment.startTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setCountdown(formatCountdown(appointment.startTime));
    }, 30_000);
    return () => clearInterval(interval);
  }, [appointment.startTime]);

  // Se puede iniciar dentro de una ventana de 15 minutos antes de la hora.
  const isWithinWindow = new Date(appointment.startTime).getTime() - now <= 15 * 60 * 1000;

  return (
    <Band
      appointment={appointment}
      chips={
        <>
          <BandChip>
            <Clock size={10} aria-hidden="true" /> {formatTime(appointment.startTime)} · {countdown}
          </BandChip>
          {appointment.sessionNumber && (
            <BandChip>
              <Hash size={10} aria-hidden="true" /> Sesión {appointment.sessionNumber}
            </BandChip>
          )}
        </>
      }
      action={
        isWithinWindow ? (
          <button
            type="button"
            onClick={() => navigate(`/session/${appointment.id}`)}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-3 text-sm font-bold text-kanji-deep transition-all duration-150 hover:bg-cruz active:scale-95 lg:w-auto"
          >
            <Play fill="currentColor" size={16} aria-hidden="true" /> Iniciar consulta
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/agenda')}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-black/25 px-5 text-left text-sm font-bold text-white transition-all duration-150 hover:bg-black/40 active:scale-95 lg:w-auto"
          >
            <Calendar size={16} aria-hidden="true" />
            <span className="font-medium">
              Programada <span className="font-bold">{formatScheduledDate(appointment.startTime)}</span>
            </span>
          </button>
        )
      }
    />
  );
}

/* ── Empty State ──────────────────────────────── */

/**
 * Sin cita: volumen bajo.
 *
 * Esto gastaba la superficie más enfática del documento — la única a sangre con
 * la rampa de marca — en anunciar ausencia de trabajo a alguien que está
 * construyendo su consulta. La rampa se reserva para cuando hay un paciente al
 * que atender (ver el contenedor de `NextAppointmentWidget`); aquí queda una
 * superficie normal y un secundario, no un botón sólido de marca.
 */
function EmptyView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-base font-bold tracking-tight text-text dark:text-white">Sin próxima cita</h3>
        <p className="mt-0.5 text-sm font-medium text-text-secondary dark:text-slate-400">
          No tienes sesiones programadas a partir de ahora.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/agenda')}
        className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-bold text-kanji-deep transition-colors hover:bg-secondary active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-kio dark:hover:bg-slate-700"
      >
        <UserPlus size={16} aria-hidden="true" /> Agendar cita
      </button>
    </div>
  );
}

/* ── Main Widget ──────────────────────────────── */

/**
 * La banda AHORA de la hoja de sala.
 *
 * Es el único elemento a sangre del documento y el único que lleva la rampa de
 * marca — cuando hay un paciente al que atender. Ya no es una rejilla de 12
 * columnas con un calendario incrustado a la derecha: es una banda de una sola
 * fila que se dimensiona por su contenido, con la acción primaria a la altura
 * del ojo del dato que la justifica.
 */
export function NextAppointmentWidget({ appointment, isLoading, isError, onRetry }: NextAppointmentProps) {
  const inProgress = appointment ? isInProgress(appointment) : false;

  // La rampa de marca se reserva para cuando hay algo que atender. Sin cita, la
  // banda baja a superficie normal: anunciar ausencia de trabajo no merece el
  // único panel a sangre del documento.
  const onBrand = isLoading || Boolean(isError) || appointment !== null;

  return (
    <div
      data-tour="tour-next-appointment"
      className={`relative overflow-hidden rounded-2xl px-5 py-5 sm:px-7 sm:py-6 ${
        onBrand
          ? 'bg-gradient-to-br from-deck-from to-deck-to text-white'
          : 'border border-border bg-surface dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 bg-black/20" />
          <Skeleton className="h-8 w-64 bg-black/20" />
        </div>
      ) : isError ? (
        <WidgetError what="tu próxima cita" onRetry={onRetry} tone="brand" />
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
