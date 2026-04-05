import { useState } from 'react';
import { Pin, Lock, FilePlus, MoreHorizontal } from 'lucide-react';
import type { TimelineItem } from '../../../types/patients.types';
import { NoteTemplateType } from '../../../types/appointments.types';
import { useTogglePin } from '../../../hooks/use-patients';
import { MoodIndicator } from './MoodIndicator';
import { useSettingsStore } from '../../../stores/settings.store';
import { MarkdownPreview } from '../../ui/MarkdownPreview';
import { AddendumList } from './AddendumList';
import { AddendumModal } from '../../session/AddendumModal';
import { TagsModal } from './TagsModal';

interface NoteCardProps {
  item: TimelineItem;
}

export function NoteCard({ item }: NoteCardProps) {
  const { mutate: togglePin } = useTogglePin();
  const { isDiscreteMode } = useSettingsStore();
  const [isAddendumModalOpen, setIsAddendumModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const note = item.psychNote;

  if (!note) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm opacity-60">
        <p className="text-sm text-gray-500 dark:text-slate-400 italic">Sin nota clínica registrada.</p>
      </div>
    );
  }

  const content = note.content as Record<string, string | undefined>;
  const isPinned = note.isPinned;
  const tags = note.tags || [];
  const visibleTags = tags.slice(0, 3);
  const hasMoreTags = tags.length > 3;

  // Check if within 30 days window
  const canAddAddendum = () => {
    const deadlineTime = new Date(item.endTime);
    deadlineTime.setDate(deadlineTime.getDate() + 30);
    return new Date() <= deadlineTime;
  };

  return (
    <div className={`group relative bg-white dark:bg-slate-900 rounded-xl border transition-all hover:shadow-md ${isPinned ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10' : 'border-gray-200 dark:border-slate-800'}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--color-kanji)]/60 dark:text-kio/60 uppercase tracking-wider">
            {note.templateType}
          </span>
          {note.moodRating && <MoodIndicator rating={note.moodRating} size="sm" />}
          {note.privateNotes && (
            <div title="Contiene notas privadas">
              <Lock size={12} className="text-amber-400" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canAddAddendum() && (
            <button
              onClick={() => setIsAddendumModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-kio dark:hover:text-kio bg-gray-50 dark:bg-slate-800/50 hover:bg-kio/10 dark:hover:bg-kio/10 rounded-md transition-colors"
              title="Agregar anexo a la nota clínica"
            >
              <FilePlus size={12} />
              Agregar Anexo
            </button>
          )}
          <button
            onClick={() => togglePin(item.id)}
            className={`p-1.5 rounded-lg transition-colors ${isPinned ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' : 'text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            title={isPinned ? "Quitar destacado" : "Destacar nota"}
          >
            <Pin size={14} className={isPinned ? "fill-current" : ""} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 text-sm text-gray-700 dark:text-slate-300 leading-relaxed ${isDiscreteMode ? 'blur-sm select-none' : ''}`}>
      {note.templateType === NoteTemplateType.SOAP ? (
          <div className="grid gap-3">
            {content.s && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] dark:text-kio mr-1">S:</span>
                <MarkdownPreview content={content.s} className="inline-block" />
              </div>
            )}
            {content.o && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] dark:text-kio mr-1">O:</span>
                <MarkdownPreview content={content.o} className="inline-block" />
              </div>
            )}
            {content.a && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] dark:text-kio mr-1">A:</span>
                <MarkdownPreview content={content.a} className="inline-block" />
              </div>
            )}
            {content.p && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] dark:text-kio mr-1">P:</span>
                <MarkdownPreview content={content.p} className="inline-block" />
              </div>
            )}
          </div>
        ) : (
          <MarkdownPreview content={content.body || content.notes || 'Contenido vacío.'} />
        )}
      </div>

      {/* Tags & Addendums */}
      <div className="px-4 pb-3">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 items-center">
            {visibleTags.map(tag => (
              <span key={tag} className="text-[10px] font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
            {hasMoreTags && (
              <button
                onClick={() => setIsTagsModalOpen(true)}
                className="text-[10px] font-bold text-kio hover:bg-kio/10 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
              >
                <MoreHorizontal size={10} />
                +{tags.length - 3} más
              </button>
            )}
          </div>
        )}
        
        <AddendumList appointmentId={item.id} />
      </div>

      <AddendumModal
        isOpen={isAddendumModalOpen}
        onClose={() => setIsAddendumModalOpen(false)}
        appointmentId={item.id}
      />

      <TagsModal
        isOpen={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
        tags={tags}
      />
    </div>
  );
}
