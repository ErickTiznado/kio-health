import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProseEditor } from './ProseEditor';

interface SoapFormProps {
  content: { s: string; o: string; a: string; p: string };
  onChange: (field: 's' | 'o' | 'a' | 'p', value: string) => void;
  readOnly?: boolean;
  onSave?: () => void;
  onFinish?: () => void;
}

const SOAP_FIELDS = [
  {
    key: 's' as const,
    label: 'Subjetivo',
    description: 'Motivo de consulta, síntomas y eventos relevantes',
    accent: 'bg-violet-500',
    accentLight: 'bg-violet-50 dark:bg-violet-500/10',
    accentBorder: 'border-violet-200 dark:border-violet-500/20',
    accentText: 'text-violet-700 dark:text-violet-400',
  },
  {
    key: 'o' as const,
    label: 'Objetivo',
    description: 'Apariencia, afecto, comportamiento y resultados de pruebas',
    accent: 'bg-blue-500',
    accentLight: 'bg-blue-50 dark:bg-blue-500/10',
    accentBorder: 'border-blue-200 dark:border-blue-500/20',
    accentText: 'text-blue-700 dark:text-blue-400',
  },
  {
    key: 'a' as const,
    label: 'Análisis',
    description: 'Interpretación, impresión diagnóstica y progreso',
    accent: 'bg-amber-500',
    accentLight: 'bg-amber-50 dark:bg-amber-500/10',
    accentBorder: 'border-amber-200 dark:border-amber-500/20',
    accentText: 'text-amber-700 dark:text-amber-400',
  },
  {
    key: 'p' as const,
    label: 'Plan',
    description: 'Intervenciones futuras, tareas y próxima cita',
    accent: 'bg-emerald-500',
    accentLight: 'bg-emerald-50 dark:bg-emerald-500/10',
    accentBorder: 'border-emerald-200 dark:border-emerald-500/20',
    accentText: 'text-emerald-700 dark:text-emerald-400',
  },
] as const;

type SoapKey = 's' | 'o' | 'a' | 'p';

/**
 * Vista previa de una sección en la barra inferior.
 *
 * Solo se quitan los marcadores markdown que abren línea y los de énfasis. La
 * versión anterior aplicaba `/[#*_~`>-]/g` a todo el texto y se comía los
 * guiones DENTRO de las palabras: "auto-lesión" se leía "autolesión" en una
 * vista previa clínica.
 */
function toPreview(text: string): string | null {
  if (!text) return null;
  const clean = text
    .split('\n')
    .map((line) => line.replace(/^\s*(#{1,6}\s+|>\s+|-\s\[[ xX]\]\s+|[-*]\s+|\d+\.\s+)/, ''))
    .join(' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return null;
  return clean.length > 60 ? `${clean.slice(0, 60)}…` : clean;
}

export function SoapForm({ content, onChange, readOnly, onSave, onFinish }: SoapFormProps) {
  const [activeTab, setActiveTab] = useState<SoapKey>('s');
  /** Solo se roba el foco cuando el salto de sección lo pidió una persona. */
  const [focusOnEnter, setFocusOnEnter] = useState(false);

  const activeField = SOAP_FIELDS.find((f) => f.key === activeTab)!;

  const goToTab = useCallback((key: SoapKey, focus: boolean) => {
    setFocusOnEnter(focus);
    setActiveTab(key);
  }, []);

  const handleSection = useCallback(
    (direction: 'prev' | 'next') => {
      const index = SOAP_FIELDS.findIndex((f) => f.key === activeTab);
      const nextIndex =
        direction === 'prev'
          ? (index - 1 + SOAP_FIELDS.length) % SOAP_FIELDS.length
          : (index + 1) % SOAP_FIELDS.length;
      goToTab(SOAP_FIELDS[nextIndex].key, true);
    },
    [activeTab, goToTab],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Secciones ── */}
      <div
        role="tablist"
        aria-label="Secciones de la nota SOAP"
        className="flex shrink-0 items-center gap-1 border-b border-border bg-surface px-4 py-2"
      >
        {SOAP_FIELDS.map(({ key, label, accent, accentText }) => {
          const isActive = activeTab === key;
          const hasContent = !!content[key]?.trim();

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => goToTab(key, false)}
              className={`relative flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                isActive
                  ? `${accentText} bg-secondary shadow-sm`
                  : 'text-text-secondary hover:bg-secondary hover:text-text'
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full transition-colors ${
                  isActive ? accent : hasContent ? `${accent} opacity-50` : 'bg-text-muted/40'
                }`}
              />
              <span className="hidden sm:inline">{label}</span>
              <span className="font-bold sm:hidden">{key.toUpperCase()}</span>
              {/* El dato no puede vivir solo en el color del punto. */}
              <span className="sr-only">
                {hasContent ? 'con contenido' : 'vacía'}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Encabezado de la sección activa ── */}
      <div
        className={`shrink-0 border-b px-6 py-3 ${activeField.accentBorder} ${activeField.accentLight}`}
      >
        <span className={`text-sm font-bold ${activeField.accentText}`}>
          {activeField.key.toUpperCase()} — {activeField.label}
        </span>
        <p className="mt-0.5 text-[11px] font-medium text-text-secondary">
          {activeField.description}
        </p>
      </div>

      {/* ── Superficie de escritura ── */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="h-full overflow-hidden"
          >
            <ProseEditor
              label={`${activeField.label} — nota SOAP`}
              value={content[activeTab] || ''}
              onChange={(markdown) => onChange(activeTab, markdown)}
              readOnly={readOnly}
              onSave={onSave}
              onFinish={onFinish}
              onSection={handleSection}
              autoFocus={focusOnEnter}
              placeholder={`${activeField.description}.`}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Las otras secciones, de un vistazo ── */}
      <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-border bg-surface px-4 py-2">
        {SOAP_FIELDS.filter(({ key }) => key !== activeTab).map(({ key, accent, accentText }) => {
          const preview = toPreview(content[key]);
          return (
            <button
              key={key}
              type="button"
              onClick={() => goToTab(key, false)}
              className="flex min-h-11 min-w-0 max-w-[250px] items-center gap-2 rounded-lg border border-border bg-secondary px-3 transition-colors hover:border-text-muted"
            >
              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${accent}`} />
              <span className={`shrink-0 text-[11px] font-bold ${accentText}`}>
                {key.toUpperCase()}
              </span>
              {preview ? (
                <span className="truncate text-[11px] font-medium text-text-secondary">
                  {preview}
                </span>
              ) : (
                <span className="text-[11px] font-medium italic text-text-muted">Vacía</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
