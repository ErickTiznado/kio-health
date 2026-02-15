import TextareaAutosize from 'react-textarea-autosize';
import { useSettingsStore } from '../../../stores/settings.store';

interface SoapFormProps {
  content: { s: string; o: string; a: string; p: string };
  onChange: (field: 's' | 'o' | 'a' | 'p', value: string) => void;
}

export function SoapForm({ content, onChange }: SoapFormProps) {
  const { isDiscreteMode } = useSettingsStore();
  const fields = [
    { key: 's', label: 'Subjetivo', placeholder: 'Lo que el paciente reporta (síntomas, preocupaciones, historia)...' },
    { key: 'o', label: 'Objetivo', placeholder: 'Observaciones clínicas, apariencia, comportamiento, resultados de pruebas...' },
    { key: 'a', label: 'Análisis', placeholder: 'Impresión diagnóstica, progreso hacia metas, interpretación clínica...' },
    { key: 'p', label: 'Plan', placeholder: 'Próxima cita, tareas, intervenciones, referencias...' },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto pr-2 pb-20">
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col h-full min-h-[200px] bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-kanji)]/20 focus-within:border-[var(--color-kanji)] transition-all">
          <div className="bg-gray-50/50 dark:bg-slate-800/50 px-4 py-2 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[var(--color-kanji)]/10 text-[var(--color-kanji)] dark:text-kio font-bold flex items-center justify-center text-xs uppercase">
              {key.toUpperCase()}
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
          </div>
          <TextareaAutosize
            value={content[key] || ''}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
            className={`flex-1 w-full p-4 resize-none outline-none text-sm text-gray-700 dark:text-slate-300 leading-relaxed placeholder:text-gray-300 dark:placeholder:text-slate-600 bg-transparent ${isDiscreteMode ? 'blur-sm' : ''}`}
            minRows={5}
          />
        </div>
      ))}
    </div>
  );
}
