import { ProseEditor } from './ProseEditor';

interface FreeFormProps {
  content: { body: string };
  onChange: (value: string) => void;
  readOnly?: boolean;
  onSave?: () => void;
  onFinish?: () => void;
  autoFocus?: boolean;
}

export function FreeForm({
  content,
  onChange,
  readOnly,
  onSave,
  onFinish,
  autoFocus,
}: FreeFormProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors focus-within:border-kanji-deep dark:focus-within:border-kio">
      <ProseEditor
        label="Nota de la sesión"
        value={content.body || ''}
        onChange={onChange}
        readOnly={readOnly}
        onSave={onSave}
        onFinish={onFinish}
        autoFocus={autoFocus}
        placeholder={'Qué ocurrió en la sesión.\n\nEscribe seguido; no hace falta estructurar. «- » abre una lista y «# » un título.'}
      />
    </div>
  );
}
