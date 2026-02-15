import { FileText, List, Brain, LayoutTemplate } from 'lucide-react';
import { NoteTemplateType } from '../../../types/appointments.types';

interface TemplateSelectorProps {
  currentType: NoteTemplateType;
  onSelect: (type: NoteTemplateType) => void;
  hasContent: boolean;
}

const TEMPLATES = [
  { id: NoteTemplateType.SOAP, label: 'SOAP', icon: List, description: 'Estructura clínica estándar' },
  { id: NoteTemplateType.FREE, label: 'Libre', icon: FileText, description: 'Texto sin formato' },
  { id: NoteTemplateType.INITIAL, label: 'Inicial', icon: LayoutTemplate, description: 'Primera sesión' },
  { id: NoteTemplateType.CBT, label: 'TCC', icon: Brain, description: 'Cognitivo-Conductual' },
];

export function TemplateSelector({ currentType, onSelect, hasContent }: TemplateSelectorProps) {
  const handleSelect = (type: NoteTemplateType) => {
    if (type === currentType) return;

    if (hasContent) {
      if (confirm('¿Cambiar de plantilla borrará el contenido actual. ¿Estás seguro?')) {
        onSelect(type);
      }
    } else {
      onSelect(type);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-slate-800/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
      {TEMPLATES.map((template) => {
        const Icon = template.icon;
        const isActive = currentType === template.id;

        return (
          <button
            key={template.id}
            onClick={() => handleSelect(template.id)}
            title={template.description}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive
                ? 'bg-white dark:bg-slate-700 text-[var(--color-kanji)] dark:text-kio shadow-sm border border-gray-200 dark:border-slate-600'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-700/50'
              }`}
          >
            <Icon size={14} className={isActive ? 'text-[var(--color-kio)]' : 'opacity-70'} />
            {template.label}
          </button>
        );
      })}
    </div>
  );
}
