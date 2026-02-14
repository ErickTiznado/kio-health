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
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm opacity-60">
        <p className="text-sm text-gray-500 italic">Sin nota clínica registrada.</p>
      </div>
    );
  }

  const content = note.content as any;
  const isPinned = note.isPinned;

  return (
    <div className={`group relative bg-white rounded-xl border transition-all hover:shadow-md ${isPinned ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--color-kanji)]/60 uppercase tracking-wider">
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
          className={`p-1.5 rounded-lg transition-colors ${isPinned ? 'text-amber-500 bg-amber-100' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'}`}
          title={isPinned ? "Quitar destacado" : "Destacar nota"}
        >
          <Pin size={14} className={isPinned ? "fill-current" : ""} />
        </button>
      </div>

      {/* Content */}
      <div className={`p-4 text-sm text-gray-700 leading-relaxed ${isDiscreteMode ? 'blur-sm select-none' : ''}`}>
        {note.templateType === NoteTemplateType.SOAP ? (
          <div className="grid gap-3">
            {content.s && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] mr-1">S:</span>
                {content.s}
              </div>
            )}
            {content.o && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] mr-1">O:</span>
                {content.o}
              </div>
            )}
            {content.a && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] mr-1">A:</span>
                {content.a}
              </div>
            )}
            {content.p && (
              <div>
                <span className="font-bold text-[var(--color-kanji)] mr-1">P:</span>
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
    </div>
  );
}
