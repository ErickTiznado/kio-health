import { useState } from 'react';
import { X, Hash } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
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

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 pt-2">
      <Hash size={14} className="text-gray-400 dark:text-slate-500" />
      {tags.map(tag => (
        <span key={tag} className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          #{tag}
          <button onClick={() => removeTag(tag)} className="hover:text-red-500 dark:hover:text-red-400">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "Añadir etiquetas (ej. ansiedad)..." : "..."}
        className="text-xs bg-transparent outline-none min-w-[120px] placeholder:text-gray-400 dark:placeholder:text-slate-600 text-gray-700 dark:text-slate-300"
      />
    </div>
  );
}
