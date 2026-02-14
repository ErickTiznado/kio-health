import type { FC } from 'react';
import { TasksWidget } from '../patient/tasks/TasksWidget';

interface PatientContextPanelProps {
  patientId: string;
  patientName: string;
  patientAge: number;
  clinicianType: string;
  psychContext: any;
  sessionHistory: any[];
}

export const PatientContextPanel: FC<PatientContextPanelProps> = ({
  patientId,
  patientName,
  patientAge,
  psychContext,
}) => {
  return (
    <div className="bg-white border-r border-gray-200 h-full p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold">{patientName}</h2>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">{patientAge} años</span>
      </div>

      <div className="mb-6 h-64">
        <TasksWidget patientId={patientId} />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Diagnóstico</h3>
        <p className="bg-indigo-50 text-indigo-700 p-3 rounded-md font-medium">
          {psychContext.diagnosis}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Contexto Clínico</h3>
        <p className="text-gray-700 text-sm leading-relaxed p-3 bg-gray-50 rounded-md border border-gray-100">
          {psychContext.clinicalContext}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Objetivos</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {(psychContext.treatmentGoals || []).map((goal: string, idx: number) => (
            <li key={idx}>{goal}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Historial Reciente</h3>
        <p className="text-gray-400 text-sm italic">Próximamente...</p>
      </div>
    </div>
  );
};
