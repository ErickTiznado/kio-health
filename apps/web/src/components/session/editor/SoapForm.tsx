import { useSettingsStore } from '../../../stores/settings.store';
import { BlockEditor } from './blocks/BlockEditor';

interface SoapFormProps {
  content: { s: string; o: string; a: string; p: string };
  onChange: (field: 's' | 'o' | 'a' | 'p', value: string) => void;
  readOnly?: boolean;
}

const SOAP_FIELDS = [
  {
    key: 's' as const,
    label: 'Subjetivo',
    description: 'Motivo de consulta, síntomas y eventos relevantes',
    color: 'text-[var(--color-kanji)] dark:text-kio',
    borderColor: 'border-[var(--color-cruz)] dark:border-slate-800',
    bgAccent: 'bg-[var(--color-bg)] dark:bg-slate-800/50',
  },
  {
    key: 'o' as const,
    label: 'Objetivo',
    description: 'Apariencia, afecto, comportamiento y resultados de pruebas',
    color: 'text-[var(--color-kanji)] dark:text-kio',
    borderColor: 'border-[var(--color-cruz)] dark:border-slate-800',
    bgAccent: 'bg-[var(--color-bg)] dark:bg-slate-800/50',
  },
  {
    key: 'a' as const,
    label: 'Análisis',
    description: 'Interpretación, impresión diagnóstica y progreso',
    color: 'text-[var(--color-kanji)] dark:text-kio',
    borderColor: 'border-[var(--color-cruz)] dark:border-slate-800',
    bgAccent: 'bg-[var(--color-bg)] dark:bg-slate-800/50',
  },
  {
    key: 'p' as const,
    label: 'Plan',
    description: 'Intervenciones futuras, tareas y próxima cita',
    color: 'text-[var(--color-kanji)] dark:text-kio',
    borderColor: 'border-[var(--color-cruz)] dark:border-slate-800',
    bgAccent: 'bg-[var(--color-bg)] dark:bg-slate-800/50',
  },
] as const;

export function SoapForm({ content, onChange, readOnly }: SoapFormProps) {
  const { isDiscreteMode } = useSettingsStore();

  return (
    <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto px-4 pb-32 pt-2">
      {SOAP_FIELDS.map(({ key, label, description, color, borderColor, bgAccent }) => (
        <div
          key={key}
          className={`bg-surface dark:bg-slate-900 rounded-2xl border ${borderColor} shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-kio/20`}
        >
          {/* Section Header */}
          <div className={`${bgAccent} px-6 py-3 border-b ${borderColor} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-black ${color} opacity-80`}>{key.toUpperCase()}</span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{label}</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">{description}</span>
              </div>
            </div>
          </div>

          {/* Block Editor */}
          <div className={`w-full overflow-y-auto ${isDiscreteMode ? 'blur-sm select-none' : ''}`}>
            <BlockEditor
              initialContent={content[key] || ''}
              onChange={(markdown) => onChange(key, markdown)}
              readOnly={readOnly}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
