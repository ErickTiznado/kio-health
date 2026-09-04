import { type FC, useState } from 'react';
import { usePatientTimeline } from '../../hooks/use-patients';
import { useRiskFlags } from '../../hooks/use-risk-flags';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClinicalDetailsModal } from './ClinicalDetailsModal';
import { TasksModal } from './TasksModal';
import { TagsModal } from '../patient/timeline/TagsModal';
import { FileText, ArrowRight, ListTodo, AlertTriangle, Phone, Stethoscope, Pill, MoreHorizontal, RotateCw } from 'lucide-react';
import { RiskFlagBadge } from '../patient/RiskFlagBadge';
import { WidgetError } from '../widgets/WidgetError';
import type { NoteContent, PsychContext } from '../../types/appointments.types';

interface PatientContextPanelProps {
  patientId: string;
  patientName: string;
  patientAge: number;
  clinicianType: string;
  psychContext: PsychContext;
}

export const PatientContextPanel: FC<PatientContextPanelProps> = ({
  patientId,
  patientName,
  psychContext,
}) => {
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    refetch: refetchTimeline,
  } = usePatientTimeline(patientId);
  const {
    data: riskFlagsData,
    isLoading: isRiskLoading,
    isError: isRiskError,
    refetch: refetchRiskFlags,
  } = useRiskFlags(patientId);

  const recentHistory = timelineData?.pages.flatMap(p => p.data).slice(0, 3) || [];

  // `riskFlags` NO cae a `[]` cuando la consulta falla: un array vacío afirma
  // "este paciente no tiene banderas de riesgo", y en un 500 o un timeout eso
  // es falso — simplemente no se sabe. `undefined` es "no lo sabemos"; `[]`
  // solo puede venir de una respuesta que el servidor sí dio.
  const riskFlags = riskFlagsData?.flagTypes;
  const hasRiskFlags = (riskFlags?.length ?? 0) > 0;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[] | null>(null);

  const emergencyContact = psychContext?.emergencyContact;

  // Antes: `hasEmergencyData = emergencyContact || riskFlags.length > 0`. Con
  // el fallback a `[]`, un fallo de red borraba el badge de riesgo; y si además
  // el paciente no tenía contacto de emergencia, la sección roja entera no se
  // renderizaba. El panel quedaba idéntico al de un paciente sin banderas —el
  // dato más crítico de la pantalla desapareciendo en silencio.
  const hasCrisisData = Boolean(emergencyContact) || hasRiskFlags;
  const showCrisisBlock = hasCrisisData || isRiskError || isRiskLoading;

  return (
    <>
      <div className="flex h-full flex-col bg-surface p-4">
        {/* Alertas y contacto de crisis.
            El bloque se fuerza a existir mientras las banderas se cargan o
            cuando su consulta ha fallado: "no hay alertas" es una afirmación
            clínica y no se puede pronunciar sin haberla podido comprobar.
            El rojo, en cambio, se reserva para cuando SÍ hay algo — teñir de
            alarma un estado de "aún no lo sé" es la otra forma de mentir. */}
        {showCrisisBlock && (
          <div
            className={`mb-6 shrink-0 rounded-xl border p-4 ${
              hasCrisisData
                ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
                : 'border-border bg-secondary'
            }`}
          >
            <h3
              className={`mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                hasCrisisData ? 'text-red-800 dark:text-red-400' : 'text-text-muted'
              }`}
            >
              <AlertTriangle size={14} aria-hidden="true" />
              Alertas y contacto de crisis
            </h3>

            {/* Error antes que vacío, y carga antes que vacío. */}
            {isRiskError ? (
              <div className="mb-3">
                <WidgetError
                  what="las banderas de riesgo de este paciente"
                  onRetry={() => void refetchRiskFlags()}
                />
              </div>
            ) : isRiskLoading ? (
              <p
                role="status"
                aria-live="polite"
                className="mb-3 text-sm font-medium text-text-secondary"
              >
                Comprobando las banderas de riesgo…
              </p>
            ) : hasRiskFlags && riskFlags ? (
              <div className="mb-3">
                <RiskFlagBadge flags={riskFlags} size="sm" />
              </div>
            ) : null}

            {emergencyContact && (
              <div className="rounded-lg border border-rose-200 bg-surface p-3 dark:border-rose-900/40">
                <p className="mb-1 flex items-center gap-2 text-sm font-bold text-text">
                  <Phone size={14} aria-hidden="true" className="text-rose-500" />
                  {emergencyContact.name}
                  {emergencyContact.relation && (
                    <span className="rounded-xs bg-secondary px-1.5 py-0.5 text-xs font-medium text-text-secondary">
                      {emergencyContact.relation}
                    </span>
                  )}
                </p>
                <a
                  href={`tel:${emergencyContact.phone}`}
                  className="text-sm font-medium text-kanji-deep hover:underline dark:text-kio"
                >
                  {emergencyContact.phone}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Medical Info */}
        <div className="mb-6 shrink-0">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            Información médica
          </h3>

          <div className="space-y-2">
            <div
              className={`rounded-md border p-3 text-sm ${
                psychContext.alergias
                  ? 'border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-900/40 dark:bg-orange-900/15 dark:text-orange-200'
                  : 'border-border bg-secondary text-text-secondary'
              }`}
            >
              <div className="mb-1 flex items-center gap-2 font-bold">
                <Stethoscope size={14} aria-hidden="true" />
                Alergias
              </div>
              <p>{psychContext.alergias || 'Sin alergias registradas'}</p>
            </div>

            <div className="rounded-md border border-border bg-secondary p-3 text-sm text-text-secondary">
              <div className="mb-1 flex items-center gap-2 font-bold">
                <Pill size={14} aria-hidden="true" />
                Medicación actual
              </div>
              <p>{psychContext.medicacionActual || 'Sin medicación registrada'}</p>
            </div>
          </div>
        </div>

        {/* Diagnosis Badge & Info Action */}
        <div className="mb-6 shrink-0">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            Diagnóstico
          </h3>
          <div className="mb-3 rounded-md border border-cruz bg-cruz p-3 text-sm font-medium text-kanji-deep dark:border-kio/20 dark:bg-kio/10 dark:text-kio">
            {psychContext.diagnosis || 'Sin diagnóstico'}
          </div>

          <button
            type="button"
            onClick={() => setIsDetailsOpen(true)}
            className="group flex min-h-11 w-full items-center justify-between rounded-md border border-border bg-secondary px-4 transition-colors hover:bg-border"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-text">
              <FileText
                size={16}
                aria-hidden="true"
                className="text-text-muted transition-colors group-hover:text-kanji-deep dark:group-hover:text-kio"
              />
              Contexto y objetivos
            </span>
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="text-text-muted transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
            />
          </button>
        </div>

        {/* Recent History */}
        <div className="mb-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <h3 className="sticky top-0 z-10 mb-3 bg-surface pb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            Historial reciente
          </h3>
          {/* Error antes que vacío, y carga antes que vacío. "Sin historial
              previo" es una afirmación sobre el expediente del paciente: no se
              puede pronunciar mientras la consulta va en vuelo ni cuando ha
              fallado. */}
          {isTimelineError ? (
            <div
              role="alert"
              className="rounded-md border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/40"
            >
              <p className="text-sm font-bold text-rose-700 dark:text-rose-200">
                No se pudo cargar el historial
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-rose-700/90 dark:text-rose-300/90">
                No significa que no haya sesiones previas: la consulta falló.
              </p>
              <button
                type="button"
                onClick={() => void refetchTimeline()}
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-rose-300 px-3 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/40"
              >
                <RotateCw size={14} aria-hidden="true" />
                Reintentar
              </button>
            </div>
          ) : isTimelineLoading ? (
            <p role="status" aria-live="polite" className="text-sm font-medium text-text-secondary">
              Cargando el historial…
            </p>
          ) : recentHistory.length > 0 ? (
            <ul className="space-y-4">
              {recentHistory.map((item) => {
                const content = item.psychNote?.content as NoteContent | undefined;
                const tags = item.psychNote?.tags || [];
                const visibleTags = tags.slice(0, 3);
                const hasMoreTags = tags.length > 3;
                const snippet = content?.s || content?.body || item.reason || 'Sin detalles';

                return (
                  <li key={item.id} className="relative border-l-2 border-border pb-1 pl-4">
                    <div className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-text-muted" />
                    <div className="text-sm font-bold text-text">
                      {format(new Date(item.startTime), "d 'de' MMMM", { locale: es })}
                    </div>
                    <div className="mb-2 mt-1 line-clamp-2 text-xs text-text-secondary">
                      {typeof snippet === 'string' ? snippet : JSON.stringify(snippet)}
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {visibleTags.map(tag => (
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-text-secondary"
                          >
                            #{tag}
                          </span>
                        ))}
                        {hasMoreTags && (
                          <button
                            type="button"
                            onClick={() => setSelectedTags(tags)}
                            aria-label={`Ver las ${tags.length} etiquetas de esta sesión`}
                            className="relative ml-0.5 flex items-center gap-0.5 text-[11px] font-bold text-kanji-deep after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:underline dark:text-kio"
                          >
                            <MoreHorizontal size={12} aria-hidden="true" />
                            +{tags.length - 3}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm italic text-text-muted">Sin historial previo.</p>
          )}
        </div>

        {/* Tasks Button (Fixed at Bottom) */}
        <div className="mt-auto shrink-0 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setIsTasksOpen(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 text-sm font-bold text-text transition-colors hover:bg-border"
          >
            <ListTodo size={18} aria-hidden="true" className="text-kanji-deep dark:text-kio" />
            Gestionar tareas
          </button>
        </div>
      </div>

      <ClinicalDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        patientName={patientName}
        psychContext={psychContext}
      />

      <TasksModal
        isOpen={isTasksOpen}
        onClose={() => setIsTasksOpen(false)}
        patientId={patientId}
      />

      <TagsModal
        isOpen={!!selectedTags}
        onClose={() => setSelectedTags(null)}
        tags={selectedTags || []}
      />
    </>
  );
};
