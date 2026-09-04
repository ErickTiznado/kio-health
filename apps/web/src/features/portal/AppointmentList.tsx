import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Check, Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  confirmPortalAppointment,
  cancelPortalAppointment,
  requestPortalReschedule,
  type PortalAppointment,
} from '../../lib/portal.api';

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  EVALUATION: 'Evaluación',
  FOLLOW_UP: 'Seguimiento',
};

interface AppointmentListProps {
  appointments: PortalAppointment[];
}

/**
 * Próximas citas del paciente con confirmar / cancelar / pedir cambio.
 *
 * Este componente solo se monta cuando la petición terminó bien: `PortalPage`
 * resuelve antes error (`isError`) y espera (`isPending`, que incluye el
 * estado pausado sin red), para que "no tienes citas" nunca se pinte sobre
 * una petición que falló o que ni siquiera salió del dispositivo.
 *
 * El púrpura legible es `kanji-deep`: `kio` mide 2.2:1 con texto blanco encima
 * y este es el botón que confirma una cita desde un móvil.
 */
export function AppointmentList({ appointments }: AppointmentListProps) {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  // El borrador pertenece a UNA cita. Con un único `message` a nivel de lista,
  // lo escrito para la cita A reaparecía prellenado al abrir "Pedir cambio" en
  // la cita B, con riesgo de enviarlo a la cita equivocada.
  const [draft, setDraft] = useState<{ id: string; text: string } | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['portal', 'appointments'] });

  const confirmMutation = useMutation({
    mutationFn: confirmPortalAppointment,
    onSuccess: () => {
      toast.success('Asistencia confirmada');
      void invalidate();
    },
    onError: () => toast.error('No se pudo confirmar. Intenta de nuevo.'),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelPortalAppointment,
    onSuccess: () => {
      toast.success('Cita cancelada. Tu profesional fue notificado.');
      setCancellingId(null);
      void invalidate();
    },
    onError: () => toast.error('No se pudo cancelar. Intenta de nuevo.'),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, msg }: { id: string; msg?: string }) =>
      requestPortalReschedule(id, msg),
    onSuccess: () => {
      toast.success('Solicitud enviada. Tu profesional te contactará.');
      setReschedulingId(null);
      setDraft(null);
      void invalidate();
    },
    onError: () => toast.error('No se pudo enviar la solicitud.'),
  });

  if (appointments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-8 text-center">
        <CalendarDays
          aria-hidden="true"
          className="w-8 h-8 text-text/50 dark:text-slate-500 mx-auto mb-2"
        />
        <p className="text-sm text-text/70 dark:text-slate-400">
          No tienes citas programadas próximamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => {
        const start = parseISO(appointment.startTime);
        const isCancelling = cancellingId === appointment.id;
        const isRescheduling = reschedulingId === appointment.id;
        const messageId = `reschedule-message-${appointment.id}`;
        const message = draft?.id === appointment.id ? draft.text : '';
        // Las mutaciones son una por lista, no una por cita: sin acotar por
        // `variables` (React Query v5), `isPending` pintaría spinner y
        // anunciaría `aria-busy` en las tres citas por una sola acción.
        const isConfirming =
          confirmMutation.isPending &&
          confirmMutation.variables === appointment.id;
        const isCancelSubmitting =
          cancelMutation.isPending &&
          cancelMutation.variables === appointment.id;
        const isRescheduleSubmitting =
          rescheduleMutation.isPending &&
          rescheduleMutation.variables?.id === appointment.id;

        return (
          <div
            key={appointment.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-kanji-deep dark:text-white capitalize">
                  {format(start, "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-sm text-text/70 dark:text-slate-400">
                  {format(start, 'hh:mm a')} ·{' '}
                  {TYPE_LABELS[appointment.type] ?? appointment.type}
                </p>
              </div>
              {appointment.confirmed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Check aria-hidden="true" size={11} /> Confirmada
                </span>
              )}
              {appointment.rescheduleRequested && !appointment.confirmed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-kanji-deep/10 dark:bg-kio/15 text-kanji-deep dark:text-kio shrink-0">
                  <RefreshCw aria-hidden="true" size={11} /> Cambio solicitado
                </span>
              )}
            </div>

            {/* Confirmar cancelación */}
            {isCancelling ? (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 space-y-3">
                <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                  ¿Seguro que deseas cancelar esta cita? Esta acción no se puede
                  deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isCancelSubmitting}
                    aria-busy={isCancelSubmitting}
                    onClick={() => cancelMutation.mutate(appointment.id)}
                    className="flex-1 min-h-11 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-colors disabled:opacity-60"
                  >
                    {isCancelSubmitting ? (
                      <>
                        <Loader2
                          aria-hidden="true"
                          size={14}
                          className="animate-spin"
                        />
                        Cancelando…
                      </>
                    ) : (
                      'Sí, cancelar'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancellingId(null)}
                    className="flex-1 min-h-11 inline-flex items-center justify-center px-3 rounded-xl border border-border dark:border-slate-700 text-sm font-bold text-text dark:text-slate-300 hover:bg-secondary dark:hover:bg-slate-800 transition-colors"
                  >
                    Volver
                  </button>
                </div>
              </div>
            ) : isRescheduling ? (
              <div className="bg-secondary dark:bg-slate-800/60 border border-border dark:border-slate-700 rounded-xl p-4 space-y-3">
                <label
                  htmlFor={messageId}
                  className="block text-xs font-bold text-text/70 dark:text-slate-400 uppercase tracking-wider"
                >
                  Mensaje para tu profesional (opcional)
                </label>
                <textarea
                  id={messageId}
                  value={message}
                  onChange={(e) =>
                    setDraft({ id: appointment.id, text: e.target.value })
                  }
                  maxLength={500}
                  rows={2}
                  placeholder="Ej. ¿Podría ser más tarde ese mismo día?"
                  className="w-full px-3 py-2.5 rounded-xl border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-text dark:text-white placeholder:text-text/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-kanji-deep focus:ring-2 focus:ring-kio/50 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isRescheduleSubmitting}
                    aria-busy={isRescheduleSubmitting}
                    onClick={() =>
                      rescheduleMutation.mutate({
                        id: appointment.id,
                        msg: message.trim() || undefined,
                      })
                    }
                    className="flex-1 min-h-11 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-kanji-deep text-white text-sm font-bold hover:bg-kanji-deep/90 transition-colors disabled:opacity-60"
                  >
                    {isRescheduleSubmitting ? (
                      <>
                        <Loader2
                          aria-hidden="true"
                          size={14}
                          className="animate-spin"
                        />
                        Enviando…
                      </>
                    ) : (
                      'Enviar solicitud'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReschedulingId(null)}
                    className="flex-1 min-h-11 inline-flex items-center justify-center px-3 rounded-xl border border-border dark:border-slate-700 text-sm font-bold text-text dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    Volver
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {!appointment.confirmed && (
                  <button
                    type="button"
                    disabled={isConfirming}
                    aria-busy={isConfirming}
                    onClick={() => confirmMutation.mutate(appointment.id)}
                    className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl bg-kanji-deep text-white text-sm font-bold hover:bg-kanji-deep/90 transition-colors disabled:opacity-60"
                  >
                    {isConfirming ? (
                      <Loader2
                        aria-hidden="true"
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Check aria-hidden="true" size={14} />
                    )}
                    Confirmar asistencia
                  </button>
                )}
                {!appointment.rescheduleRequested && (
                  <button
                    type="button"
                    onClick={() => {
                      setReschedulingId(appointment.id);
                      setCancellingId(null);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl border border-border dark:border-slate-700 text-sm font-bold text-text dark:text-slate-300 hover:border-kanji-deep hover:text-kanji-deep dark:hover:border-kio dark:hover:text-kio transition-colors"
                  >
                    <RefreshCw aria-hidden="true" size={14} /> Pedir cambio
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCancellingId(appointment.id);
                    setReschedulingId(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl border border-border dark:border-slate-700 text-sm font-bold text-text/70 dark:text-slate-400 hover:border-rose-400 hover:text-rose-700 dark:hover:border-rose-500/50 dark:hover:text-rose-300 transition-colors"
                >
                  <X aria-hidden="true" size={14} /> Cancelar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
