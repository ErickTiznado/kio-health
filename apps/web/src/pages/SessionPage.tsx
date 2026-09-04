import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

import { SessionLayout } from '../components/session/SessionLayout';
import { EditorContainer } from '../components/session/editor/EditorContainer';
import { SessionCheckoutModal } from '../components/session/SessionCheckoutModal';
import { WidgetError } from '../components/widgets/WidgetError';
import { useSessionSnapshot, useStartSession, useMarkNoShow } from '../hooks/use-session';
import { useNoteStore } from '../stores/notes.store';
import { confirmAction } from '../lib/confirm-action';
import { capture } from '../lib/analytics';

/**
 * Estados en los que la nota clínica ya no admite cambios y solo queda el anexo.
 *
 * `COMPLETED` NO está aquí, y esa ausencia es el arreglo. La regla real vive en
 * `upsertPsychNote` (apps/api/src/appointments/appointments.service.ts): el
 * servidor bloquea la escritura únicamente si han pasado 24 h desde `endTime`
 * Y la nota YA existe. El estado de la cita no interviene.
 *
 * Con `COMPLETED` en la lista, el editor abría en solo lectura para
 * exactamente el conjunto que `GET /appointments/pending-notes-count` cuenta
 * (COMPLETED + sin nota): el 100% de las notas pendientes eran ilegibles de
 * escribir y el contador del dashboard no podía bajar nunca. El bucle
 * agenda → sesión → nota → cobro no cerraba.
 *
 * `CANCELLED` y `NO_SHOW` sí se quedan: no hubo sesión que documentar, así que
 * lo que haya que dejar dicho es un anexo, no una nota de sesión.
 */
const LOCKED_STATUSES = ['CANCELLED', 'NO_SHOW'];

/** Edad en años cumplidos — restar solo el año se equivoca hasta el cumpleaños. */
function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Clinical Session Page — Deep Work environment.
 */
export function SessionPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const {
    data: sessionContext,
    isLoading,
    isError,
    refetch,
  } = useSessionSnapshot(appointmentId || '');
  const { mutate: startSession, isPending: isStarting } = useStartSession();
  const { mutate: markNoShow } = useMarkNoShow();
  const flushPendingSave = useNoteStore((s) => s.flushPendingSave);
  // Hay texto de nota que solo existe en esta pestaña. Cerrarla lo destruye.
  const hasOfflineData = useNoteStore((s) => s.hasOfflineData);
  // Solo para saber si la nota YA existe: es la mitad de la regla de bloqueo
  // del servidor. Lectura, no escritura — el store lo gobierna el editor.
  const currentNote = useNoteStore((s) => s.currentNote);

  // Marca tomada al abrir la pantalla, igual que hace `EditorContainer`.
  // Cruzar el límite de 24 h con la página abierta es un caso que ya cubre el
  // rechazo del servidor; recalcularlo en cada render haría que la nota se
  // cerrara sola bajo el cursor.
  const [openedAt] = useState(() => Date.now());

  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasUnsavedScales, setHasUnsavedScales] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (sessionContext?.appointment.status === 'IN_PROGRESS') {
      const startTime = new Date(sessionContext.appointment.startTime).getTime();
      const endTime = new Date(sessionContext.appointment.endTime).getTime();

      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((now - startTime) / 1000));

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        setElapsedTime(
          [hours, minutes, seconds]
            .map((unit) => String(unit).padStart(2, '0'))
            .join(':')
        );

        setIsOvertime(now > endTime);
      };

      updateTimer();
      intervalId = setInterval(updateTimer, 1000);
    }

    return () => clearInterval(intervalId);
  }, [sessionContext?.appointment.status, sessionContext?.appointment.startTime, sessionContext?.appointment.endTime]);

  // Recarga o cierre de pestaña con la nota a medio guardar.
  //
  // `hasOfflineData` entra aquí y no en el guard de navegación porque la
  // diferencia es real: ir a /agenda conserva el búfer, cerrar la pestaña lo
  // borra. Es el único sitio donde ese aviso corresponde.
  useEffect(() => {
    if (!hasUnsavedChanges && !hasUnsavedScales && !hasOfflineData) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedChanges, hasUnsavedScales, hasOfflineData]);

  /**
   * Guard único de "hay trabajo sin guardar".
   *
   * Vivía solo en el botón ATRÁS. El botón verde de finalizar —el que se usa
   * para terminar TODAS las sesiones— abría el cobro directamente, y el modal
   * navega a `/agenda` al confirmar: eso desmonta el editor con el debounce de
   * 1 s pendiente. Escribir una última frase y pulsar finalizar la perdía. La
   * ruta más transitada era la desprotegida.
   */
  const ensureSaved = useCallback(async (): Promise<boolean> => {
    // Primero se intenta lo obvio: escribir ya lo que el debounce aún no mandó,
    // en vez de preguntarle al clínico por algo que la app puede resolver sola.
    const savedOk = hasUnsavedChanges ? await flushPendingSave() : true;

    // El estado del store se lee DESPUÉS del intento, y a propósito no se
    // mira solo `hasUnsavedChanges`: un guardado ya rechazado por el servidor
    // (el caso vivo es el bloqueo de 24 h) deja el DTO "limpio" — no está sucio
    // porque ya se intentó — mientras el texto sigue sin estar en el servidor.
    // Esa era la ruta por la que el botón atrás navegaba sin preguntar nada.
    const { status: noteStatus, error: noteError } = useNoteStore.getState();

    const scalesPending = hasUnsavedScales;
    const notePending = !savedOk || noteStatus === 'error';
    if (!scalesPending && !notePending) return true;

    // SONDA: ¿el espacio de sesión se siente cerrado?
    // Que el aviso salga mucho ya dice que el autoguardado va por detrás de
    // cómo trabaja la gente. Que se resuelva con `left: false` dice algo peor:
    // el clínico quería irse y la app no le dejó marcharse tranquilo.
    capture('session_exit_guard_shown', {});

    const reason = notePending && noteError ? ` Motivo: ${noteError}` : '';
    const description = notePending
      ? (scalesPending
          ? 'La nota no se pudo guardar y hay respuestas de escala sin guardar. Si continúas podrías perderlas.'
          : 'La nota no se pudo guardar en el servidor. Si continúas podrías perder los últimos cambios.') + reason
      : 'Hay respuestas de escala sin guardar. Las escalas no se guardan solas: si continúas se pierden.';

    const confirmed = await confirmAction({
      title: 'Trabajo sin guardar',
      description,
      confirmLabel: 'Continuar de todas formas',
      cancelLabel: 'Volver a la nota',
      variant: 'warning',
    });

    capture('session_exit_guard_resolved', { left: confirmed });
    return confirmed;
  }, [flushPendingSave, hasUnsavedChanges, hasUnsavedScales]);

  const handleLeave = useCallback(async () => {
    if (!(await ensureSaved())) return;
    navigate('/agenda');
  }, [ensureSaved, navigate]);

  const handleFinishSession = useCallback(async () => {
    if (!(await ensureSaved())) return;
    setIsCheckoutOpen(true);
  }, [ensureSaved]);

  // El error se comprueba ANTES que la carga y antes que cualquier vacío: un
  // snapshot fallido giraba para siempre, sin mensaje, sin reintento y sin
  // `role="status"`. En un expediente clínico eso es indistinguible de una app
  // colgada.
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <div className="w-full max-w-md space-y-4">
          <WidgetError what="esta sesión" onRetry={() => void refetch()} />
          <button
            type="button"
            onClick={() => navigate('/agenda')}
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold text-text-secondary transition-colors hover:bg-secondary hover:text-text"
          >
            Volver a la agenda
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !sessionContext) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg"
      >
        <div className="size-12 animate-spin rounded-full border-b-2 border-kanji-deep motion-reduce:animate-none dark:border-kio" />
        <p className="text-sm font-medium text-text-secondary">Cargando la sesión…</p>
      </div>
    );
  }

  const { appointment, patient, lastVisit, sessionNumber } = sessionContext;

  // El cronómetro solo corre en sesión activa. Fuera de ella se deriva el valor
  // en reposo en vez de resetear el estado desde el efecto.
  const isRunning = appointment.status === 'IN_PROGRESS';
  const displayedElapsed = isRunning ? elapsedTime : '00:00:00';
  const displayedOvertime = isRunning && isOvertime;
  const isStatusLocked = LOCKED_STATUSES.includes(appointment.status);
  // Espejo de la regla de integridad clínica del backend (`upsertPsychNote`):
  // 24h tras el fin de la cita la nota deja de ser editable — pero solo si ya
  // existe. `EditorContainer` es quien aplica ese candado (recibe la fecha
  // límite y conoce la nota cargada); aquí se replica únicamente para poder
  // explicar el bloqueo, no para imponerlo dos veces.
  const editDeadline = new Date(new Date(appointment.endTime).getTime() + 24 * 60 * 60 * 1000);
  const noteAlreadyExists = Boolean(currentNote && currentNote.appointmentId === appointment.id);
  const isDeadlineLocked = noteAlreadyExists && openedAt > editDeadline.getTime();
  const isNoteLocked = isStatusLocked || isDeadlineLocked;

  const handleStartSession = () => {
    if (appointmentId && !isStarting) {
      startSession(appointmentId);
    }
  };

  const handleNoShow = async () => {
    const confirmed = await confirmAction({
      title: '¿Marcar como no asistió?',
      description: 'Esta acción cambiará el estado de la cita permanentemente.',
      confirmLabel: 'Sí, marcar',
      cancelLabel: 'No, volver',
      variant: 'warning',
    });
    if (confirmed) {
      // El aviso de error lo pone `useMarkNoShow`; duplicarlo aquí sacaría dos
      // toasts por el mismo fallo.
      markNoShow(appointmentId!, {
        onSuccess: () => {
          toast.success('Cita marcada como no asistió');
          navigate('/agenda');
        },
      });
    }
  };

  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : undefined;

  // El panel de contexto necesita el bloque de crisis y la información médica;
  // omitirlos aquí dejaba las alertas de riesgo permanentemente vacías.
  const psychContext = {
    diagnosis: patient.diagnosis || 'Sin diagnóstico',
    clinicalContext: patient.clinicalContext || 'Sin contexto registrado',
    treatmentGoals: patient.treatmentGoals || [],
    totalSessions: sessionNumber,
    emergencyContact: patient.emergencyContact,
    medicacionActual: patient.medicacionActual,
    alergias: patient.alergias,
  };

  return (
    <>
      <SessionLayout
        patientId={patient.id}
        patientName={patient.fullName}
        patientAge={age}
        sessionNumber={sessionNumber}
        elapsedTime={displayedElapsed}
        isOvertime={displayedOvertime}
        lastVisit={lastVisit}
        status={appointment.status}
        isStarting={isStarting}
        onStartSession={handleStartSession}
        onFinishSession={() => void handleFinishSession()}
        onNoShow={handleNoShow}
        onLeave={handleLeave}
      >
        <div className="flex h-full flex-col">
          {/* Cuando la nota está bloqueada, el camino se dice AQUÍ.
              El editor muestra un candado y un botón «Agregar anexo», pero qué
              es un anexo —y por qué no es lo mismo que editar— solo se explicaba
              dentro del modal, es decir, después de decidir abrirlo. */}
          {isNoteLocked && (
            <div className="shrink-0 border-b border-border bg-secondary px-4 py-2.5">
              {/* `text-text`, no `text-text-secondary`: en claro este cuerpo es
                  #64748b sobre #ece9e3 (bg-secondary) = 3.65:1, por debajo del
                  4.5:1 que pide AA a 12 px. Con `text-text` (#213547) sube a
                  10.4:1 y en oscuro (#f8fafc sobre #1e293b) queda muy por
                  encima. La jerarquía la lleva el `font-bold` del fragmento del
                  anexo, no una diferencia de color que costaba legibilidad
                  justo en la copia que explica por qué el expediente está
                  cerrado. */}
              <p className="flex items-start gap-2 text-xs font-medium text-text">
                <Lock size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>
                  {isDeadlineLocked
                    ? 'Han pasado 24 h desde el fin de la sesión: la nota queda fija por integridad del expediente. '
                    : appointment.status === 'CANCELLED'
                      ? 'La cita quedó cancelada, así que su nota no admite cambios. '
                      : 'La cita quedó marcada como no asistió, así que su nota no admite cambios. '}
                  <span className="font-bold">
                    Lo que necesites añadir se registra como anexo
                  </span>
                  : se suma al expediente con su propia fecha y autor, sin alterar lo ya escrito.
                  El botón «Agregar anexo» está en la barra del editor.
                </span>
              </p>
            </div>
          )}

          <div className="min-h-0 flex-1">
            <EditorContainer
              appointmentId={appointment.id}
              patientId={patient.id}
              patientName={patient.fullName}
              patientAge={age}
              psychContext={psychContext}
              clinicalScales={sessionContext.clinicalScales}
              // Solo el estado. El candado de 24 h lo aplica `EditorContainer`
              // a partir de `editDeadline` + la nota cargada, que es donde se
              // sabe si la nota existe: pasarlo también aquí lo duplicaría.
              readOnly={isStatusLocked}
              editDeadline={editDeadline}
              onDirtyChange={setHasUnsavedChanges}
              onScalesDirtyChange={setHasUnsavedScales}
              onRequestFinish={isRunning ? () => void handleFinishSession() : undefined}
            />
          </div>
        </div>
      </SessionLayout>

      <SessionCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        appointmentId={appointmentId ?? ''}
        price={appointment.price}
        patientName={patient.fullName}
        isSeriesAppointment={Boolean(appointment.seriesId)}
        clinicalScales={sessionContext.clinicalScales}
      />
    </>
  );
}
