import { BlockEditor } from './blocks/BlockEditor';

interface FreeFormProps {
  content: { body: string };
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function FreeForm({ content, onChange, readOnly }: FreeFormProps) {
  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-[var(--color-kanji)]/20 focus-within:border-[var(--color-kanji)] transition-all">
      <div className="bg-gray-50/50 dark:bg-slate-800/50 px-4 py-2 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Notas Libres (Bloques)</span>
        <span className="text-[10px] text-gray-400 dark:text-slate-500">Arrastra elementos</span>
      </div>

      <div className="flex-1 w-full overflow-y-auto p-6 custom-scrollbar">
        <BlockEditor
          initialContent={content.body || ''}
          onChange={onChange}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
