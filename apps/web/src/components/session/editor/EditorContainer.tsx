import { useEffect, useState, useRef } from 'react';
import { useNoteStore } from '../../../stores/notes.store';
import { useAutoSave } from '../../../hooks/use-auto-save';
import { NoteTemplateType } from '../../../types/appointments.types';
import { TemplateSelector } from './TemplateSelector';
import { MoodTracker } from './MoodTracker';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { SoapForm } from './SoapForm';
import { FreeForm } from './FreeForm';
import { PrivateNotesPanel } from './PrivateNotesPanel';
import { TagInput } from './TagInput';
import { Copy, Lock, FileDown, Repeat, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

interface EditorContainerProps {
  appointmentId: string;
  patientId: string;
}

export function EditorContainer({ appointmentId, patientId }: EditorContainerProps) {
  const { currentNote, status, lastSaved, error, fetchNote } = useNoteStore();

  // Local state for immediate UI feedback (synced with store via auto-save)
  const [templateType, setTemplateType] = useState<NoteTemplateType>(NoteTemplateType.FREE);
  const [content, setContent] = useState<any>({ body: '' });
  const [moodRating, setMoodRating] = useState<number>(5);
  const [tags, setTags] = useState<string[]>([]);
  const [privateNotes, setPrivateNotes] = useState<string>('');
  const [isPrivatePanelOpen, setIsPrivatePanelOpen] = useState(false);
  const hasInitialized = useRef(false);

  // Initial Fetch
  useEffect(() => {
    if (appointmentId) {
      fetchNote(appointmentId);
    }
  }, [appointmentId, fetchNote]);

  // Sync state when store updates (only once or on explicit external update)
  useEffect(() => {
    if (currentNote && !hasInitialized.current) {
      setTemplateType(currentNote.templateType);
      setContent(currentNote.content);
      if (currentNote.moodRating) setMoodRating(currentNote.moodRating);
      if (currentNote.privateNotes) setPrivateNotes(currentNote.privateNotes);
      if ((currentNote as any).tags) setTags((currentNote as any).tags);
      hasInitialized.current = true;
    }
  }, [currentNote]);

  // Auto-save Hook
  useAutoSave(appointmentId, content, templateType, moodRating, privateNotes, tags);

  // Handlers
  const handleTemplateChange = (type: NoteTemplateType) => {
    setTemplateType(type);
    if (type === NoteTemplateType.SOAP) {
      setContent({ s: '', o: '', a: '', p: '' });
    } else {
      setContent({ body: '' });
    }
  };

  const handleCopyStructure = () => {
    let textToCopy = '';

    if (templateType === NoteTemplateType.SOAP) {
      textToCopy = `S: ${content.s || ''}

O: ${content.o || ''}

A: ${content.a || ''}

P: ${content.p || ''}`;
    } else {
      textToCopy = content.body || '';
    }

    navigator.clipboard.writeText(textToCopy);
    toast.success('Copiado al portapapeles');
  };

  const handleExportPdf = async () => {
    try {
      const includePrivate = confirm('¿Incluir notas privadas en el reporte PDF?');
      toast.info('Generando PDF...');

      const response = await api.get(`/appointments/${appointmentId}/export/pdf`, {
        params: { includePrivate },
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

  const handleDuplicateLast = async () => {
    if (JSON.stringify(content).length > 20 && !confirm('¿Sobrescribir nota actual con la anterior?')) {
      return;
    }

    try {
      const { data: lastNote } = await api.get(`/patients/${patientId}/last-note`);
      if (!lastNote) {
        toast.warning('No hay notas previas para duplicar');
        return;
      }

      if (lastNote.templateType) setTemplateType(lastNote.templateType);
      if (lastNote.content) setContent(lastNote.content);
      if (lastNote.tags) setTags(lastNote.tags);

      toast.success('Nota duplicada');
    } catch (_e) {
      toast.error('Error al duplicar nota');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] dark:bg-slate-950 relative overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <TemplateSelector
            currentType={templateType}
            onSelect={handleTemplateChange}
            hasContent={JSON.stringify(content).length > 20}
          />
          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700" />
          <MoodTracker value={moodRating} onChange={setMoodRating} />
        </div>

        <div className="flex items-center gap-4">
          <SaveStatusIndicator status={status} lastSaved={lastSaved} error={error} />

          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />

          <button
            onClick={handleDuplicateLast}
            className="p-2 text-gray-400 dark:text-slate-500 hover:text-[var(--color-kanji)] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Duplicar última nota"
          >
            <Repeat size={18} />
          </button>

          <button
            className="p-2 text-gray-300 dark:text-slate-600 cursor-not-allowed rounded-lg transition-colors"
            title="Resumen con IA (Próximamente)"
          >
            <Sparkles size={18} />
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />

          <button
            onClick={handleCopyStructure}
            className="p-2 text-gray-400 dark:text-slate-500 hover:text-[var(--color-kanji)] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Copiar estructura"
          >
            <Copy size={18} />
          </button>

          <button
            onClick={handleExportPdf}
            className="p-2 text-gray-400 dark:text-slate-500 hover:text-[var(--color-kanji)] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Exportar PDF"
          >
            <FileDown size={18} />
          </button>

          <button
            onClick={() => setIsPrivatePanelOpen(!isPrivatePanelOpen)}
            className={`p-2 rounded-lg transition-colors ${isPrivatePanelOpen ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
            title="Notas Privadas"
          >
            <Lock size={18} />
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <TagInput tags={tags} onChange={setTags} />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="h-full max-w-5xl mx-auto">
            {templateType === NoteTemplateType.SOAP ? (
              <SoapForm
                content={content}
                onChange={(key, val) => setContent((prev: any) => ({ ...prev, [key]: val }))}
              />
            ) : (
              <FreeForm
                content={content}
                onChange={(val) => setContent({ body: val })}
              />
            )}
          </div>
        </div>
      </div>

      {/* Private Notes Sidebar */}
      <PrivateNotesPanel
        isOpen={isPrivatePanelOpen}
        onToggle={() => setIsPrivatePanelOpen(!isPrivatePanelOpen)}
        value={privateNotes}
        onChange={setPrivateNotes}
      />
    </div>
  );
}
