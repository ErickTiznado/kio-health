import { useState } from 'react';
import { X, Hash } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function TagInput({ tags, onChange, suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('');

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

  return (
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap px-4 pt-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 min-h-[42px] focus-within:ring-2 focus-within:ring-kio/20 transition-all">
        <Hash size={14} className="text-gray-400 dark:text-slate-500" />
        {tags.map(tag => (
            <span key={tag} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
            #{tag}
            <button onClick={() => removeTag(tag)} className="hover:text-indigo-800 dark:hover:text-indigo-100">
                <X size={12} />
            </button>
            </span>
        ))}
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Añadir etiquetas..." : ""}
            className="text-xs bg-transparent outline-none flex-1 min-w-[120px] placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-700 dark:text-slate-200 py-1"
        />
        </div>
        
        {/* Suggestions */}
        {availableSuggestions.length > 0 && (
            <div className="flex gap-2 px-1">
                {availableSuggestions.map(s => (
                    <button
                        key={s}
                        onClick={() => addTag(s)}
                        className="text-[10px] font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
                    >
                        + #{s}
                    </button>
                ))}
            </div>
        )}
    </div>
  );
}
