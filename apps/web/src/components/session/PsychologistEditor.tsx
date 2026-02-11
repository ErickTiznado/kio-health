import { useState, type FC } from 'react';
import { ClinicalEditor } from './ClinicalEditor';

interface EmotionalTag {
  readonly id: string;
  readonly label: string;
  readonly color: string;
  readonly activeBackground: string;
  readonly activeBorder: string;
}

const EMOTIONAL_TAGS: readonly EmotionalTag[] = [
  {
    id: 'anxiety',
    label: 'Ansiedad',
    color: 'text-amber-700',
    activeBackground: 'bg-amber-50',
    activeBorder: 'border-amber-200',
  },
  {
    id: 'depression',
    label: 'Depresión',
    color: 'text-indigo-700',
    activeBackground: 'bg-indigo-50',
    activeBorder: 'border-indigo-200',
  },
  {
    id: 'progress',
    label: 'Progreso',
    color: 'text-emerald-700',
    activeBackground: 'bg-emerald-50',
    activeBorder: 'border-emerald-200',
  },
  {
    id: 'stress',
    label: 'Estrés',
    color: 'text-rose-700',
    activeBackground: 'bg-rose-50',
    activeBorder: 'border-rose-200',
  },
  {
    id: 'grief',
    label: 'Duelo',
    color: 'text-slate-700',
    activeBackground: 'bg-slate-50',
    activeBorder: 'border-slate-200',
  },
  {
    id: 'selfEsteem',
    label: 'Autoestima',
    color: 'text-violet-700',
    activeBackground: 'bg-violet-50',
    activeBorder: 'border-violet-200',
  },
] as const;

/**
 * Psychologist session view — emotional tags bar + full ClinicalEditor.
 * Tags are toggleable pills positioned above the writing canvas.
 */
export const PsychologistEditor: FC = () => {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const toggleTag = (tagId: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* ── Emotional Tags Bar ── */}
      <div className="px-6 py-3 bg-white/60 backdrop-blur-sm border-b border-gray-100/60">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2 shrink-0">
            Tags
          </span>
          <div className="flex flex-wrap gap-2">
            {EMOTIONAL_TAGS.map((tag) => {
              const isActive = activeTags.has(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                    ${
                      isActive
                        ? `${tag.activeBackground} ${tag.activeBorder} ${tag.color} shadow-sm scale-[1.02]`
                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }
                  `}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Full Clinical Editor ── */}
      <div className="flex-1 min-h-0">
        <ClinicalEditor />
      </div>
    </div>
  );
};
