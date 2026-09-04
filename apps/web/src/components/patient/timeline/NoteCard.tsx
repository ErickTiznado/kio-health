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
          <span className="text-xs font-bold text-kanji-deep dark:text-kio uppercase tracking-wider">
            {note.templateType}
          </span>
          {note.moodRating && <MoodIndicator rating={note.moodRating} size="sm" />}
          {/* El candado llevaba el dato solo en `title`: en tactil y con
              lector de pantalla eso no existe. Ahora el hecho es texto. */}
          {note.privateNotes && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
              <Lock size={12} aria-hidden="true" />
              Notas privadas
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canAddAddendum() && (
            <button
              onClick={() => setIsAddendumModalOpen(true)}
              className="flex min-h-11 items-center gap-1.5 rounded-xl bg-gray-50 px-3 text-xs font-bold text-slate-600 transition-colors duration-150 hover:bg-cruz/40 hover:text-kanji-deep dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-kio/10 dark:hover:text-kio"
            >
              <FilePlus size={13} aria-hidden="true" />
              Agregar anexo
            </button>
          )}
          <button
            onClick={() => togglePin(item.id)}
            aria-pressed={isPinned}
            aria-label={isPinned ? 'Quitar de notas destacadas' : 'Destacar esta nota'}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-150 ${isPinned ? 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30' : 'text-slate-600 hover:text-kanji-deep hover:bg-secondary dark:text-slate-400 dark:hover:text-kio dark:hover:bg-slate-800'}`}
          >
            <Pin size={15} aria-hidden="true" className={isPinned ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 text-sm text-gray-700 dark:text-slate-300 leading-relaxed ${isDiscreteMode ? 'blur-sm select-none' : ''}`}>
      {note.templateType === NoteTemplateType.SOAP ? (
          <div className="grid gap-3">
            {content.s && (
              <div>
                <span className="font-bold text-kanji-deep dark:text-kio mr-1">S:</span>
                <MarkdownPreview content={content.s} className="inline-block" />
              </div>
            )}
            {content.o && (
              <div>
                <span className="font-bold text-kanji-deep dark:text-kio mr-1">O:</span>
                <MarkdownPreview content={content.o} className="inline-block" />
              </div>
            )}
            {content.a && (
              <div>
                <span className="font-bold text-kanji-deep dark:text-kio mr-1">A:</span>
                <MarkdownPreview content={content.a} className="inline-block" />
              </div>
            )}
            {content.p && (
              <div>
                <span className="font-bold text-kanji-deep dark:text-kio mr-1">P:</span>
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
              <span key={tag} className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
            {hasMoreTags && (
              <button
                onClick={() => setIsTagsModalOpen(true)}
                className="flex min-h-11 items-center gap-1 rounded-full px-2 text-[11px] font-bold text-kanji-deep transition-colors duration-150 hover:bg-kio/10 dark:text-kio"
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
