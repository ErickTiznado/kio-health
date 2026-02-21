import { type FC, useState } from 'react';
import { usePatientTimeline } from '../../hooks/use-patients';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClinicalDetailsModal } from './ClinicalDetailsModal';
import { TasksModal } from './TasksModal';
import { FileText, ArrowRight, ListTodo } from 'lucide-react';

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
  const recentHistory = timelineData?.pages.flatMap(p => p.data).slice(0, 3) || [];
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-full p-6 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6 shrink-0">
          <h2 className="text-xl font-bold dark:text-white truncate" title={patientName}>{patientName}</h2>
          <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded text-sm whitespace-nowrap">{patientAge} años</span>
        </div>

        {/* Diagnosis Badge & Info Action */}
        <div className="mb-8 shrink-0">
          <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Diagnóstico</h3>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 p-3 rounded-xl font-medium text-sm border border-indigo-100 dark:border-indigo-800/30 mb-3">
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
                const snippet = content?.s || content?.body || item.reason || 'Sin detalles';

                return (
                  <li key={item.id} className="relative pl-4 border-l-2 border-gray-200 dark:border-slate-700 pb-1">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600" />
                    <div className="font-bold text-gray-700 dark:text-slate-200 text-sm">
                      {format(new Date(item.startTime), "d 'de' MMMM", { locale: es })}
                    </div>
                    <div className="text-gray-500 dark:text-slate-400 text-xs line-clamp-2 mt-1">
                      {typeof snippet === 'string' ? snippet : JSON.stringify(snippet)}
                    </div>
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
    </>
  );
};
