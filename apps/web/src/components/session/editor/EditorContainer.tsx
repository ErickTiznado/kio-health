import { useEffect, useState, useRef } from 'react';
import { useNoteStore } from '../../../stores/notes.store';
import { useAutoSave } from '../../../hooks/use-auto-save';
import { NoteTemplateType } from '../../../types/appointments.types';

import { MoodTracker } from './MoodTracker';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { SoapForm } from './SoapForm';
import { FreeForm } from './FreeForm';
import { TagInput } from './TagInput';
import { EditorToolbox } from './EditorToolbox';
import { Check, PenTool, Target, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { PatientContextPanel } from '../PatientContextPanel';

interface EditorContainerProps {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  psychContext: any;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const MOCK_TAG_SUGGESTIONS = ['Ansiedad', 'Progreso', 'TDAH', 'Sueño', 'Autoestima'];

export function EditorContainer({
  appointmentId,
  patientId,
  patientName,
  patientAge,
  psychContext
}: EditorContainerProps) {
  const { currentNote, status, lastSaved, error, fetchNote } = useNoteStore();

  // Local state
  const [step, setStep] = useState<1 | 2>(1); // 1: Check-in, 2: Notes
  const [templateType, setTemplateType] = useState<NoteTemplateType>(NoteTemplateType.FREE);
  const [content, setContent] = useState<any>({ body: '', sessionGoal: '' });
  const [moodRating, setMoodRating] = useState<number>(5);
  const [tags, setTags] = useState<string[]>([]);
  const [isReadMode, setIsReadMode] = useState(false);
  const hasInitialized = useRef(false);

  // Initial Fetch
  useEffect(() => {
    if (appointmentId) {
      fetchNote(appointmentId);
    }
  }, [appointmentId, fetchNote]);

  // Sync state
  useEffect(() => {
    if (currentNote && !hasInitialized.current) {
      setTemplateType(currentNote.templateType);
      setContent(currentNote.content);
      if (currentNote.moodRating) setMoodRating(currentNote.moodRating);
      if ((currentNote as any).tags) setTags((currentNote as any).tags);
      hasInitialized.current = true;

      const hasRealContent =
        (currentNote.content.body && currentNote.content.body.length > 5) ||
        (currentNote.content.s && currentNote.content.s.length > 5);

      if (hasRealContent) {
        setStep(2);
      }
    }
  }, [currentNote]);

  // Auto-save
  useAutoSave(appointmentId, content, templateType, moodRating, undefined, tags);

  // Handlers
  const handleTemplateChange = (type: NoteTemplateType) => {
    if (JSON.stringify(content).length > 40 && !confirm('Cambiar de plantilla podría alterar el contenido. ¿Continuar?')) {
      return;
    }
    setTemplateType(type);
    const sessionGoal = content.sessionGoal || '';

    if (type === NoteTemplateType.SOAP) {
      setContent({ s: '', o: '', a: '', p: '', sessionGoal });
    } else {
      setContent({ body: '', sessionGoal });
    }
  };

  const handleCopyStructure = () => {
    let textToCopy = '';
    if (templateType === NoteTemplateType.SOAP) {
      textToCopy = `S: ${content.s || ''}\n\nO: ${content.o || ''}\n\nA: ${content.a || ''}\n\nP: ${content.p || ''}`;
    } else {
      textToCopy = content.body || '';
    }
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copiado al portapapeles');
  };

  const handleExportPdf = async () => {
    try {
      toast.info('Generando PDF...');
      const response = await api.get(`/appointments/${appointmentId}/export/pdf`, {
        params: { includePrivate: false },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `session-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF descargado');
    } catch (_error) {
      toast.error('Error al generar PDF');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] dark:bg-slate-950 relative overflow-hidden">

      {/* Guided Process Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm z-10 transition-all duration-300">
        <div className="flex items-center">
          {/* Step 1 Indicator */}
          <button
            onClick={() => setStep(1)}
            className={`group flex items-center gap-3 transition-all ${step === 1 ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step === 1
              ? 'border-kio bg-kio text-white shadow-lg shadow-kio/30'
              : step > 1
                ? 'border-kio/50 bg-kio/10 text-kio'
                : 'border-gray-300 dark:border-slate-600 text-gray-400'
              }`}>
              {step > 1 ? <Check size={16} /> : '1'}
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className={`text-xs font-bold uppercase tracking-wider ${step === 1 ? 'text-kio' : 'text-gray-500 dark:text-slate-500'}`}>
                Contexto
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white hidden sm:inline">Preparación</span>
            </div>
          </button>

          {/* Connector Line */}
          <div className={`w-12 h-0.5 mx-4 rounded-full transition-all duration-500 ${step === 2 ? 'bg-kio' : 'bg-gray-200 dark:bg-slate-700'
            }`} />

          {/* Step 2 Indicator */}
          <button
            onClick={() => setStep(2)}
            className={`group flex items-center gap-3 transition-all ${step === 2 ? 'opacity-100' : 'opacity-40'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step === 2
              ? 'border-kio bg-kio text-white shadow-lg shadow-kio/30'
              : 'border-gray-300 dark:border-slate-600 text-gray-400 bg-white dark:bg-slate-800'
              }`}>
              <PenTool size={14} />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className={`text-xs font-bold uppercase tracking-wider ${step === 2 ? 'text-kio' : 'text-gray-500 dark:text-slate-500'}`}>
                Notas
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white hidden sm:inline">Documentación</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <SaveStatusIndicator status={status} lastSaved={lastSaved} error={error} />

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => setIsReadMode(!isReadMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isReadMode
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
              >
                {isReadMode ? (
                  <>
                    <PenTool size={14} />
                    Editar
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Lectura
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Wizard Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full grid grid-cols-12"
            >
              {/* Left: Patient Context (Sidebar) */}
              <div className="col-span-4 border-r border-gray-200 dark:border-slate-800 h-full overflow-hidden bg-white dark:bg-slate-900">
                <PatientContextPanel
                  patientId={patientId}
                  patientName={patientName}
                  patientAge={patientAge || 0}
                  clinicianType="PSYCHOLOGIST"
                  psychContext={psychContext}
                />
              </div>

              {/* Right: Session Prep */}
              <div className="col-span-8 h-full overflow-y-auto p-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-950">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="max-w-xl w-full space-y-8"
                >
                  <motion.div variants={itemVariants} className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-kanji dark:text-white mb-2">Preparación de Sesión</h2>
                    <p className="text-gray-500 dark:text-slate-400">Revisa el contexto y define el estado inicial del paciente.</p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-8">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Estado de Ánimo</label>
                      <div className="flex justify-center">
                        <MoodTracker
                          value={moodRating}
                          onChange={setMoodRating}
                          label="Percepción Inicial de Ánimo"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800 w-full" />

                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Etiquetas</label>
                      <TagInput
                        tags={tags}
                        onChange={setTags}
                        suggestions={MOCK_TAG_SUGGESTIONS}
                      />
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800 w-full" />

                    <div>
                      <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target size={14} />
                        Objetivo Principal
                      </label>
                      <textarea
                        value={content.sessionGoal || ''}
                        onChange={(e) => setContent({ ...content, sessionGoal: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-kio/20 focus:border-kio transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        rows={2}
                        placeholder="Ej. Trabajar en técnicas de afrontamiento para la ansiedad..."
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-kio hover:bg-kanji text-white rounded-xl font-bold text-lg shadow-lg shadow-kio/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    Iniciar Documentación
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex"
            >
              {/* Left Toolbox (Ribbon) - Only in Edit Mode */}
              {!isReadMode && (
                <EditorToolbox
                  currentTemplate={templateType}
                  onTemplateChange={handleTemplateChange}
                  onCopy={handleCopyStructure}
                  onExport={handleExportPdf}
                />
              )}

              {/* Main Editor */}
              <div className="flex-1 h-full overflow-hidden bg-white dark:bg-slate-900">
                {templateType === NoteTemplateType.SOAP ? (
                  <SoapForm
                    content={content}
                    onChange={(key, val) => setContent((prev: any) => ({ ...prev, [key]: val }))}
                    readOnly={isReadMode}
                  />
                ) : (
                  <FreeForm
                    content={content}
                    onChange={(val) => setContent({ body: val })}
                    readOnly={isReadMode}
                  />
                )}
              </div>

              {/* Floating Back Button (Context) */}
              <div className="absolute bottom-6 left-6 z-20 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 text-gray-500 hover:text-kanji border border-gray-200 dark:border-slate-700 rounded-full shadow-md text-xs font-bold transition-all"
                >
                  <ArrowLeft size={14} />
                  Ver Contexto
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
