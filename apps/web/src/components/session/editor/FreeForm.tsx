import { BlockEditor } from './blocks/BlockEditor';

interface FreeFormProps {
  content: { body: string };
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function FreeForm({ content, onChange, readOnly }: FreeFormProps) {
  return (
    <div className="h-full bg-surface dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-[var(--color-kanji)]/20 focus-within:border-[var(--color-kanji)] transition-all">
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
