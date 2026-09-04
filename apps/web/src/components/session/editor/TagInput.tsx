import { useState } from 'react';
import { X, Hash, MoreHorizontal, LayoutGrid } from 'lucide-react';
import { TagsManagerModal } from './TagsManagerModal';
import { SuggestionsModal } from './SuggestionsModal';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function TagInput({ tags, onChange, suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('');
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const val = input.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
        setInput('');
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const addTag = (val: string) => {
    if (val && !tags.includes(val)) {
        onChange([...tags, val]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const availableSuggestions = suggestions.filter(s => !tags.includes(s));
  
  const visibleTags = tags.slice(0, 3);
  const hiddenTagsCount = tags.length - 3;
  
  const visibleSuggestions = availableSuggestions.slice(0, 3);
  const hasMoreSuggestions = availableSuggestions.length > 3;

  return (
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap px-4 py-1 border border-gray-200 dark:border-slate-700 rounded-xl bg-surface dark:bg-slate-800 min-h-11 focus-within:ring-2 focus-within:ring-kio/20 transition-all">
        <Hash size={14} aria-hidden="true" className="text-gray-400 dark:text-slate-500" />
        
        {visibleTags.map(tag => (
            <span key={tag} className="bg-cruz dark:bg-kio/20 text-kanji-deep dark:text-kio text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
            #{tag}
            {/* El área táctil sube a 44px con un pseudo-elemento: estirar el chip
                rompería la fila de etiquetas del panel. */}
            <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Quitar la etiqueta ${tag}`}
                className="relative after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:text-kanji-deep/70 dark:hover:text-kio/70"
            >
                <X size={12} aria-hidden="true" />
            </button>
            </span>
        ))}

        {hiddenTagsCount > 0 && (
          <button
            type="button"
            onClick={() => setIsTagsModalOpen(true)}
            className="relative text-[11px] font-bold text-kanji-deep dark:text-kio bg-kio/10 px-2 py-1 rounded-md flex items-center gap-1 after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:bg-kio/20 transition-colors"
          >
            <MoreHorizontal size={12} aria-hidden="true" />
            +{hiddenTagsCount} más
          </button>
        )}

        {/* El `min-h-11` va en el input, no en el envoltorio: el input es el
            control que se toca. Un `<input>` es elemento reemplazado y no
            renderiza `::after`, así que el pseudo-elemento de 44px que usan los
            chips de arriba aquí no sirve — la altura tiene que ser real. */}
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Añadir una etiqueta a la sesión"
            placeholder={tags.length === 0 ? 'Añadir etiquetas…' : ''}
            className="text-xs bg-transparent outline-none flex-1 min-w-[120px] min-h-11 placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-700 dark:text-slate-200 py-1"
        />
        </div>
        
        {/* Sugerencias — mismo pseudo-elemento de 44px que los chips de arriba:
            son atajos de una línea y crecer en alto partiría la fila. */}
        {availableSuggestions.length > 0 && (
            <div className="flex items-center gap-2 px-1">
                <div className="flex gap-2">
                  {visibleSuggestions.map(s => (
                      <button
                          key={s}
                          type="button"
                          onClick={() => addTag(s)}
                          className="relative text-[11px] font-bold text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
                      >
                          + #{s}
                      </button>
                  ))}
                </div>

                {hasMoreSuggestions && (
                  <button
                    type="button"
                    onClick={() => setIsSuggestionsModalOpen(true)}
                    className="relative text-[11px] font-bold text-kanji-deep dark:text-kio flex items-center gap-1 px-2 py-1 after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:bg-kio/5 rounded-md transition-colors"
                  >
                    <LayoutGrid size={12} aria-hidden="true" />
                    Ver todas
                  </button>
                )}
            </div>
        )}

        <TagsManagerModal 
          isOpen={isTagsModalOpen}
          onClose={() => setIsTagsModalOpen(false)}
          tags={tags}
          onRemoveTag={removeTag}
        />

        <SuggestionsModal
          isOpen={isSuggestionsModalOpen}
          onClose={() => setIsSuggestionsModalOpen(false)}
          suggestions={availableSuggestions}
          onAddTag={addTag}
        />
    </div>
  );
}
