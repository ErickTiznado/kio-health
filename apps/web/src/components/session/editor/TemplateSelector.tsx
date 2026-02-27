import { useState, useRef, useEffect } from 'react';
import { FileText, List, Brain, LayoutTemplate, ChevronDown, Check } from 'lucide-react';
import { NoteTemplateType } from '../../../types/appointments.types';
import { motion, AnimatePresence } from 'framer-motion';
import { confirmAction } from '../../../lib/confirm-action';

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (type: NoteTemplateType) => {
    if (type === currentType) {
      setIsOpen(false);
      return;
    }

    if (hasContent) {
      const confirmed = await confirmAction({
        title: '¿Cambiar plantilla?',
        description: 'Cambiar de plantilla podría alterar el contenido actual.',
        confirmLabel: 'Sí, cambiar',
        cancelLabel: 'Cancelar',
        variant: 'warning',
      });
      if (!confirmed) return;
    }

    onSelect(type);
    setIsOpen(false);
  };

  const activeTemplate = TEMPLATES.find(t => t.id === currentType) || TEMPLATES[0];
  const ActiveIcon = activeTemplate.icon;

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
      >
        <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <ActiveIcon size={14} />
        </span>
        <span className="text-xs uppercase tracking-wide font-bold">{activeTemplate.label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-56 bg-surface dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 p-1.5 z-50 overflow-hidden"
          >
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1.5 mb-1">
                Seleccionar Plantilla
            </div>
            {TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isActive = currentType === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'} />
                  <div className="flex-1">
                      <div className="text-xs font-bold">{template.label}</div>
                      <div className="text-[10px] opacity-70 font-normal leading-tight mt-0.5">{template.description}</div>
                  </div>
                  {isActive && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
