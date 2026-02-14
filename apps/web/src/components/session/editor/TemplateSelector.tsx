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
      // In a real app, use a proper modal. For MVP, confirm is fine or a custom toast with action.
      // But standard confirm is blocking and safe.
      if (confirm('¿Cambiar de plantilla borrará el contenido actual. ¿Estás seguro?')) {
        onSelect(type);
      }
    } else {
      onSelect(type);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200">
      {TEMPLATES.map((template) => {
        const Icon = template.icon;
        const isActive = currentType === template.id;
        
        return (
          <button
            key={template.id}
            onClick={() => handleSelect(template.id)}
            title={template.description}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              isActive 
                ? 'bg-white text-[var(--color-kanji)] shadow-sm border border-gray-200' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
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
