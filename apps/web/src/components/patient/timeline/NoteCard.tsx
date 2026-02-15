import { Pin, Lock } from 'lucide-react';
import type { TimelineItem } from '../../../types/patients.types';
import { NoteTemplateType } from '../../../types/appointments.types';
import { useTogglePin } from '../../../hooks/use-patients';
import { MoodIndicator } from './MoodIndicator';
import { useSettingsStore } from '../../../stores/settings.store';

interface NoteCardProps {
  item: TimelineItem;
}

export function NoteCard({ item }: NoteCardProps) {
  const { mutate: togglePin } = useTogglePin();
  const { isDiscreteMode } = useSettingsStore();
  const note = item.psychNote;

  if (!note) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm opacity-60">
        <p className="text-sm text-gray-500 dark:text-slate-400 italic">Sin nota clínica registrada.</p>
      </div>
    );
  }

  const content = note.content as any;
  const isPinned = note.isPinned;

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

        <button
          onClick={() => togglePin(item.id)}
          className={`p-1.5 rounded-lg transition-colors ${isPinned ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' : 'text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
          title={isPinned ? "Quitar destacado" : "Destacar nota"}
        >
          <Pin size={14} className={isPinned ? "fill-current" : ""} />
        </button>
      </div>

      {/* Content */}
      <div className={`p-4 text-sm text-gray-700 dark:text-slate-300 leading-relaxed ${isDiscreteMode ? 'blur-sm select-none' : ''}`}>
        {note.templateType === NoteTemplateType.SOAP ? (
          <div className="grid gap-3">
            {content.s && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] dark:text-kio mr-1">S:</span>
                {content.s}
              </div>
            )}
            {content.o && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] dark:text-kio mr-1">O:</span>
                {content.o}
              </div>
            )}
            {content.a && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] dark:text-kio mr-1">A:</span>
                {content.a}
              </div>
            )}
            {content.p && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] dark:text-kio mr-1">P:</span>
                {content.p}
              </div>
            )}
          </div>
        ) : (
          <div className="whitespace-pre-wrap font-sans">
            {content.body || content.notes || 'Contenido vacío.'}
          </div>
        )}
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {note.tags.map(tag => (
            <span key={tag} className="text-[10px] font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
