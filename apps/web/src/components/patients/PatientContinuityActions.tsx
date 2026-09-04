import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ScheduleAppointmentModal } from '../../features/calendar/components/ScheduleAppointmentModal';
import { usePatientTodayAppointment } from '../../hooks/use-patients';

/**
 * Hora de arranque del modal: la siguiente hora en punto, en hora LOCAL.
 *
 * Es un valor por defecto editable, no una propuesta: se elige "la próxima
 * hora" y no "ahora mismo" porque una cita fechada en el instante del clic ya
 * está en el pasado para cuando se envía el formulario.
 */
function nextFullHour(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

interface PatientContinuityActionsProps {
  patientId: string;
  patientName: string;
}

/**
 * Las dos acciones que sacan al expediente del callejón sin salida.
 *
 * Desde `/patients/:id` no se podía agendar la siguiente cita ni entrar a la
 * sesión de hoy: la cabecera ofrecía WhatsApp, teléfono y un lápiz. El
 * presupuesto real del clínico es el rato entre sesiones (PRODUCT.md,
 * principio 2) y se gastaba en volver a la agenda a buscar al mismo paciente.
 *
 * - **Agendar cita** abre el MISMO modal de la agenda
 *   (`ScheduleAppointmentModal`) con el paciente ya seleccionado. No se
 *   duplica el formulario ni se navega a `/agenda`: el modal ya acepta
 *   `initialPatient` e invalida `['appointments']` al crear. Se pinta por
 *   portal a `document.body` — ver la nota junto al `createPortal`.
 * - **Abrir sesión** solo aparece cuando HOY hay una cita `SCHEDULED` o
 *   `IN_PROGRESS` de este paciente, y lleva a `/session/:id` — la misma ruta
 *   que usan la agenda y el panel. Cuando no la hay, o cuando no pudimos
 *   leer la agenda del día, el botón simplemente no está: no se afirma en
 *   ningún caso que el paciente no tenga sesión.
 */
export function PatientContinuityActions({ patientId, patientName }: PatientContinuityActionsProps) {
  const navigate = useNavigate();
  const [scheduleAnchor, setScheduleAnchor] = useState<Date | null>(null);
  const { data: todayAppointment } = usePatientTodayAppointment(patientId);

  // `initialPatient` está en las dependencias del efecto de reinicio del modal:
  // un objeto nuevo en cada render lo haría reiniciar el asistente mientras el
  // clínico lo está rellenando.
  const initialPatient = useMemo(
    () => ({ id: patientId, fullName: patientName }),
    [patientId, patientName],
  );

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      {todayAppointment && (
        <button
          type="button"
          onClick={() => navigate(`/session/${todayAppointment.id}`)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text transition-colors duration-150 hover:border-kanji/40 hover:bg-secondary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-kio/40 dark:hover:bg-slate-700"
        >
          <PlayCircle size={16} aria-hidden="true" />
          {todayAppointment.status === 'IN_PROGRESS' ? 'Volver a la sesión' : 'Abrir sesión'}
          {/* La hora no vive solo en el hover ni solo en un color: es texto. */}
          <span className="font-medium tabular-nums text-slate-600 dark:text-slate-400">
            {format(new Date(todayAppointment.startTime), 'HH:mm')}
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={() => setScheduleAnchor(nextFullHour())}
        // El hover NO puede caer en `bg-kanji`: blanco sobre `#8a72d1` mide
        // 3.90:1 y 14px en negrita no es "texto grande". `kanji-deep/90` sobre
        // superficie clara mide ~5.7:1 y es además el hover mayoritario de la
        // casa (ConfirmDialog, FeedbackWidget, SessionLayout y el propio
        // ScheduleAppointmentModal que abre este botón).
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-kanji-deep px-4 text-sm font-bold text-white shadow-sm shadow-kio/20 transition-colors duration-150 hover:bg-kanji-deep/90 hover:shadow-md hover:shadow-kio/20 dark:bg-kio dark:text-slate-900 dark:hover:bg-cruz"
      >
        <CalendarPlus size={16} aria-hidden="true" />
        Agendar cita
      </button>

      {/* POR QUÉ `createPortal`: este componente vive dentro del encabezado
          `sticky top-0 z-30` del expediente, y `position: sticky` con z-index
          crea contexto de apilamiento. El `fixed inset-0 z-50` del modal
          quedaba encerrado ahí dentro, de modo que en `lg+` el sidebar
          (`fixed h-full z-40` de DashboardLayout) se pintaba POR ENCIMA del
          backdrop: la navegación quedaba sin oscurecer, sin blur y clicable
          con el diálogo abierto, y se podía salir a media captura de la cita.
          Los otros tres consumidores del modal (AgendaPage, DashboardLayout,
          AppointmentDrawer) lo montan en la raíz de la página y no tienen el
          problema; aquí el portal es lo que consigue lo mismo. Es el patrón ya
          usado por PatientsTable, DatePicker y MovimientosTab.

          POR QUÉ montado solo mientras está abierto: no es una optimización de
          red — DashboardLayout ya mantiene una instancia permanente del modal
          y su `usePatients` comparte clave de caché, así que una segunda
          instancia fría no pediría nada extra. Es para no tener dos copias del
          formulario en el árbol y para que su estado (paso del asistente,
          campos a medio llenar) se reinicie al cerrar. */}
      {scheduleAnchor !== null &&
        createPortal(
          <ScheduleAppointmentModal
            isOpen
            onClose={() => setScheduleAnchor(null)}
            initialDate={scheduleAnchor}
            initialPatient={initialPatient}
          />,
          document.body,
        )}
    </div>
  );
}
