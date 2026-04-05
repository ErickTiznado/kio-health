import { type FC, useState } from 'react';
import { usePatientTimeline } from '../../hooks/use-patients';
import { useRiskFlags } from '../../hooks/use-risk-flags';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClinicalDetailsModal } from './ClinicalDetailsModal';
import { TasksModal } from './TasksModal';
import { TagsModal } from '../patient/timeline/TagsModal';
import { FileText, ArrowRight, ListTodo, AlertTriangle, Phone, Stethoscope, Pill, MoreHorizontal } from 'lucide-react';
import { RiskFlagBadge } from '../patient/RiskFlagBadge';

interface PatientContextPanelProps {
  patientId: string;
  patientName: string;
  patientAge: number;
  clinicianType: string;
  psychContext: any;
}

export const PatientContextPanel: FC<PatientContextPanelProps> = ({
  patientId,
  patientName,
  patientAge,
  psychContext,
}) => {
  const { data: timelineData } = usePatientTimeline(patientId);
  const { data: riskFlagsData } = useRiskFlags(patientId);
  
  const recentHistory = timelineData?.pages.flatMap(p => p.data).slice(0, 3) || [];
  const riskFlags = riskFlagsData?.flagTypes || [];
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[] | null>(null);

  const emergencyContact = psychContext?.emergencyContact;
  const hasEmergencyData = emergencyContact || riskFlags.length > 0;
  
  return (
    <>
      <div className="bg-surface dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-full p-6 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6 shrink-0">
          <h2 className="text-xl font-bold dark:text-white truncate" title={patientName}>{patientName}</h2>
          <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded text-sm whitespace-nowrap">{patientAge} años</span>
        </div>

        {/* Crisis Contacts (Conditional) */}
        {hasEmergencyData && (
          <div className="mb-6 shrink-0 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
            <h3 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              Alertas y Contacto de Crisis
            </h3>
            
            {riskFlags.length > 0 && (
              <div className="mb-3">
                <RiskFlagBadge flags={riskFlags} size="sm" />
              </div>
            )}
            
            {emergencyContact && (
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-red-100 dark:border-red-900/40">
                <p className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                  <Phone size={14} className="text-red-500" />
                  {emergencyContact.name}
                  {emergencyContact.relation && (
                    <span className="text-xs font-normal text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {emergencyContact.relation}
                    </span>
                  )}
                </p>
                <a 
                  href={`tel:${emergencyContact.phone}`}
                  className="text-sm text-kio hover:underline font-medium"
                >
                  {emergencyContact.phone}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Medical Info */}
        <div className="mb-6 shrink-0">
          <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Información Médica</h3>
          
          <div className="space-y-2">
            <div className={`p-3 rounded-xl border text-sm ${psychContext.alergias ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30 text-orange-800 dark:text-orange-300' : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400'}`}>
              <div className="flex items-center gap-2 mb-1 font-bold">
                <Stethoscope size={14} />
                Alergias
              </div>
              <p>{psychContext.alergias || 'Sin alergias registradas'}</p>
            </div>
            
            <div className="p-3 rounded-xl border bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-800 text-sm text-gray-600 dark:text-slate-400">
              <div className="flex items-center gap-2 mb-1 font-bold">
                <Pill size={14} />
                Medicación Actual
              </div>
              <p>{psychContext.medicacionActual || 'Sin medicación registrada'}</p>
            </div>
          </div>
        </div>

        {/* Diagnosis Badge & Info Action */}
        <div className="mb-8 shrink-0">
          <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Diagnóstico</h3>
          <div className="bg-cruz dark:bg-kio/10 text-kanji dark:text-kio/90 p-3 rounded-xl font-medium text-sm border border-cruz dark:border-kio/20 mb-3">
            {psychContext.diagnosis || 'Sin diagnóstico'}
          </div>

          <button
            onClick={() => setIsDetailsOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-gray-200 dark:border-slate-700 group"
            title="Ver Contexto y Objetivos"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300">
              <FileText size={16} className="text-gray-400 dark:text-slate-500 group-hover:text-kio transition-colors" />
              Contexto y Objetivos
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Recent History */}
        <div className="flex-1 overflow-y-auto min-h-0 mb-6 pr-1">
          <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 sticky top-0 bg-white dark:bg-slate-900 z-10 pb-2">
            Historial Reciente
          </h3>
          {recentHistory.length > 0 ? (
            <ul className="space-y-4">
              {recentHistory.map((item) => {
                const content = item.psychNote?.content;
                const tags = item.psychNote?.tags || [];
                const visibleTags = tags.slice(0, 3);
                const hasMoreTags = tags.length > 3;
                const snippet = (content as any)?.s || (content as any)?.body || item.reason || 'Sin detalles';

                return (
                  <li key={item.id} className="relative pl-4 border-l-2 border-gray-200 dark:border-slate-700 pb-1">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600" />
                    <div className="font-bold text-gray-700 dark:text-slate-200 text-sm">
                      {format(new Date(item.startTime), "d 'de' MMMM", { locale: es })}
                    </div>
                    <div className="text-gray-500 dark:text-slate-400 text-xs line-clamp-2 mt-1 mb-2">
                      {typeof snippet === 'string' ? snippet : JSON.stringify(snippet)}
                    </div>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        {visibleTags.map(tag => (
                          <span key={tag} className="text-[9px] font-medium text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-full border border-gray-100 dark:border-slate-800">
                            #{tag}
                          </span>
                        ))}
                        {hasMoreTags && (
                          <button
                            onClick={() => setSelectedTags(tags)}
                            className="text-[9px] font-bold text-kio hover:underline flex items-center gap-0.5 ml-0.5"
                          >
                            <MoreHorizontal size={8} />
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
            <p className="text-gray-400 dark:text-slate-500 text-sm italic">Sin historial previo.</p>
          )}
        </div>

        {/* Tasks Button (Fixed at Bottom) */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setIsTasksOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl transition-all border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md font-bold text-sm"
          >
            <ListTodo size={18} className="text-kio" />
            Gestionar Tareas
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
