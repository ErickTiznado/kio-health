import TextareaAutosize from 'react-textarea-autosize';
import { useSettingsStore } from '../../../stores/settings.store';

interface FreeFormProps {
  content: { body: string };
  onChange: (value: string) => void;
}

export function FreeForm({ content, onChange }: FreeFormProps) {
  const { isDiscreteMode } = useSettingsStore();

  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-[var(--color-kanji)]/20 focus-within:border-[var(--color-kanji)] transition-all">
      <div className="bg-gray-50/50 dark:bg-slate-800/50 px-4 py-2 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Notas Libres</span>
        <span className="text-[10px] text-gray-400 dark:text-slate-500">Markdown compatible</span>
      </div>
      <TextareaAutosize
        value={content.body || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="# Título de la sesión&#10;&#10;Comienza a escribir libremente..."
        className={`flex-1 w-full p-6 resize-none outline-none text-base text-gray-700 dark:text-slate-300 leading-relaxed placeholder:text-gray-300 dark:placeholder:text-slate-600 font-mono bg-transparent ${isDiscreteMode ? 'blur-sm' : ''}`}
        minRows={15}
      />
    </div>
  );
}
