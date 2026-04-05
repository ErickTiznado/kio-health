import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    accent: 'bg-violet-500',
    accentLight: 'bg-violet-50 dark:bg-violet-500/10',
    accentBorder: 'border-violet-200 dark:border-violet-500/20',
    accentText: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'o' as const,
    label: 'Objetivo',
    description: 'Apariencia, afecto, comportamiento y resultados de pruebas',
    accent: 'bg-blue-500',
    accentLight: 'bg-blue-50 dark:bg-blue-500/10',
    accentBorder: 'border-blue-200 dark:border-blue-500/20',
    accentText: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'a' as const,
    label: 'Análisis',
    description: 'Interpretación, impresión diagnóstica y progreso',
    accent: 'bg-amber-500',
    accentLight: 'bg-amber-50 dark:bg-amber-500/10',
    accentBorder: 'border-amber-200 dark:border-amber-500/20',
    accentText: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'p' as const,
    label: 'Plan',
    description: 'Intervenciones futuras, tareas y próxima cita',
    accent: 'bg-emerald-500',
    accentLight: 'bg-emerald-50 dark:bg-emerald-500/10',
    accentBorder: 'border-emerald-200 dark:border-emerald-500/20',
    accentText: 'text-emerald-600 dark:text-emerald-400',
  },
] as const;

type SoapKey = 's' | 'o' | 'a' | 'p';

export function SoapForm({ content, onChange, readOnly }: SoapFormProps) {
  const { isDiscreteMode } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SoapKey>('s');

  const activeField = SOAP_FIELDS.find((f) => f.key === activeTab)!;

  const getPreview = (key: SoapKey) => {
    const text = content[key] || '';
    if (!text) return null;
    const clean = text.replace(/[#*_~`>-]/g, '').trim();
    return clean.length > 60 ? clean.slice(0, 60) + '...' : clean;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shrink-0">
        {SOAP_FIELDS.map(({ key, label, accent, accentText }) => {
          const isActive = activeTab === key;
          const hasContent = !!content[key]?.trim();

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? `${accentText} bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-200 dark:ring-slate-700`
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-all ${isActive ? accent : hasContent ? `${accent} opacity-50` : 'bg-gray-300 dark:bg-slate-600'}`} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden font-black">{key.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* Section Header */}
      <div className={`px-6 py-3 border-b ${activeField.accentBorder} ${activeField.accentLight} flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${activeField.accent}`} />
          <div>
            <span className={`text-sm font-bold ${activeField.accentText}`}>
              {activeField.key.toUpperCase()} — {activeField.label}
            </span>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{activeField.description}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1">
          {SOAP_FIELDS.map(({ key }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-6 h-1.5 rounded-full transition-all ${
                activeTab === key
                  ? activeField.accent
                  : content[key]?.trim()
                    ? 'bg-gray-300 dark:bg-slate-600'
                    : 'bg-gray-200 dark:bg-slate-700'
              }`}
              title={SOAP_FIELDS.find((f) => f.key === key)!.label}
            />
          ))}
        </div>
      </div>

      {/* Editor Area — full remaining height */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`h-full overflow-hidden ${isDiscreteMode ? 'blur-sm select-none' : ''}`}
          >
            <BlockEditor
              initialContent={content[activeTab] || ''}
              onChange={(markdown) => onChange(activeTab, markdown)}
              readOnly={readOnly}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: Content preview strip */}
      <div className="shrink-0 border-t border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-4 py-2 flex gap-2 overflow-x-auto">
        {SOAP_FIELDS.filter(({ key }) => key !== activeTab).map(({ key, accent, accentText }) => {
          const preview = getPreview(key);
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-gray-300 dark:hover:border-slate-600 transition-all min-w-0 max-w-[250px]"
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent}`} />
              <span className={`text-[11px] font-bold shrink-0 ${accentText}`}>{key.toUpperCase()}</span>
              {preview ? (
                <span className="text-[11px] text-gray-400 dark:text-slate-500 truncate">{preview}</span>
              ) : (
                <span className="text-[11px] text-gray-300 dark:text-slate-600 italic">Vacío</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
