import { useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useSettingsStore } from '../../../stores/settings.store';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from '../../ui/MarkdownPreview';
import { Eye, Edit2 } from 'lucide-react';

interface SoapFormProps {
  content: { s: string; o: string; a: string; p: string };
  onChange: (field: 's' | 'o' | 'a' | 'p', value: string) => void;
  readOnly?: boolean;
}

interface SoapFieldProps {
  fieldKey: 's' | 'o' | 'a' | 'p';
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isDiscreteMode: boolean;
}

function SoapField({ fieldKey, label, placeholder, value, onChange, isDiscreteMode }: SoapFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-kio/20 focus-within:border-kio transition-all overflow-hidden">
      <div className="bg-gray-50/50 dark:bg-slate-800/50 px-6 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{label}</span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{fieldKey.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-2">
          {!isPreviewMode && (
            <div className="scale-95 origin-right opacity-60 hover:opacity-100 transition-opacity">
              <MarkdownToolbar textareaRef={textareaRef} onTextChange={onChange} />
            </div>
          )}
          <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all ${isPreviewMode ? 'text-kio bg-kio/10' : ''}`}
            title={isPreviewMode ? "Editar" : "Vista previa"}
          >
            {isPreviewMode ? <Edit2 size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className={`flex-1 w-full ${isDiscreteMode ? 'blur-sm' : ''}`}>
        {isPreviewMode ? (
          <div className="p-6 h-full overflow-y-auto min-h-[150px]">
            <MarkdownPreview content={value || ''} />
            {!value && <span className="text-gray-300 italic text-sm">Sin contenido...</span>}
          </div>
        ) : (
          <TextareaAutosize
            ref={textareaRef}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-6 resize-none outline-none text-base text-gray-700 dark:text-slate-300 leading-relaxed placeholder:text-gray-300 dark:placeholder:text-slate-600 bg-transparent min-h-[150px]"
            minRows={5}
          />
        )}
      </div>
    </div>
  );
}

export function SoapForm({ content, onChange }: SoapFormProps) {
  const { isDiscreteMode } = useSettingsStore();
  const fields = [
    {
      key: 's',
      label: 'Lo que dice el paciente',
      sub: 'Subjetivo',
      placeholder: 'Describe el motivo de consulta, síntomas reportados y eventos relevantes desde la última sesión...'
    },
    {
      key: 'o',
      label: 'Mis observaciones',
      sub: 'Objetivo',
      placeholder: 'Apariencia, afecto, comportamiento durante la sesión y resultados de pruebas...'
    },
    {
      key: 'a',
      label: 'Análisis Clínico',
      sub: 'Análisis',
      placeholder: 'Interpretación de los datos, impresión diagnóstica y progreso hacia los objetivos...'
    },
    {
      key: 'p',
      label: 'Plan de Tratamiento',
      sub: 'Plan',
      placeholder: 'Intervenciones futuras, tareas asignadas y próxima cita...'
    },
  ] as const;

  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto pr-4 pb-32 max-w-4xl mx-auto">
      {fields.map(({ key, label, placeholder }) => (
        <SoapField
          key={key}
          fieldKey={key}
          label={label}
          placeholder={placeholder}
          value={content[key]}
          onChange={(val) => onChange(key, val)}
          isDiscreteMode={isDiscreteMode}
        />
      ))}
    </div>
  );
}
