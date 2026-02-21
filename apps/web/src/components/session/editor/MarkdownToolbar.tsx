import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote } from 'lucide-react';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onTextChange: (newText: string) => void;
}

export function MarkdownToolbar({ textareaRef, onTextChange }: MarkdownToolbarProps) {
  const handleFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);

    const newText = text.substring(0, start) + prefix + selection + suffix + text.substring(end);
    
    // Optimistic update
    onTextChange(newText);

    // Restore focus and cursor
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selection.length + suffix.length;
      // Ideally keep selection if it existed, but simple cursor placement is fine for MVP
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selection.length);
    });
  };

  const tools = [
    { icon: Bold, label: 'Negrita', prefix: '**', suffix: '**' },
    { icon: Italic, label: 'Cursiva', prefix: '*', suffix: '*' },
    { icon: Heading1, label: 'Título 1', prefix: '# ', suffix: '' },
    { icon: Heading2, label: 'Título 2', prefix: '## ', suffix: '' },
    { icon: List, label: 'Lista', prefix: '- ', suffix: '' },
    { icon: ListOrdered, label: 'Lista num.', prefix: '1. ', suffix: '' },
    { icon: Quote, label: 'Cita', prefix: '> ', suffix: '' },
  ];

  return (
    <div className="flex items-center gap-1 p-1">
      {tools.map((tool, idx) => {
        const Icon = tool.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleFormat(tool.prefix, tool.suffix)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
            title={tool.label}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
