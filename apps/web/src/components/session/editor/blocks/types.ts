export type BlockType = 'h1' | 'h2' | 'paragraph' | 'bullet-list' | 'number-list' | 'check-list' | 'quote';

export type ListPosition = 'first' | 'middle' | 'last' | 'only' | null;

export const LIST_BLOCK_TYPES: BlockType[] = ['bullet-list', 'number-list', 'check-list'];

export const isListBlockType = (type: BlockType): boolean => LIST_BLOCK_TYPES.includes(type);

export interface ListItem {
  id: string;
  content: string;
  checked?: boolean; // For check-list only
}

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string;       // Used for non-list types
  items?: ListItem[];    // Used for list types
  checked?: boolean;     // Legacy, kept for check compatibility
}

// Helpers to identify block types from markdown lines
type MarkdownLineType = 'h1' | 'h2' | 'paragraph' | 'bullet' | 'number' | 'check' | 'quote';

export const detectLineType = (line: string): MarkdownLineType => {
  if (line.startsWith('# ')) return 'h1';
  if (line.startsWith('## ')) return 'h2';
  if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) return 'check';
  if (line.startsWith('- ') || line.startsWith('* ')) return 'bullet';
  if (line.match(/^\d+\. /)) return 'number';
  if (line.startsWith('> ')) return 'quote';
  return 'paragraph';
};

export const lineTypeToBlockType = (lineType: MarkdownLineType): BlockType => {
  switch (lineType) {
    case 'bullet': return 'bullet-list';
    case 'number': return 'number-list';
    case 'check': return 'check-list';
    default: return lineType as BlockType;
  }
};

export const cleanLineContent = (line: string, lineType: MarkdownLineType): string => {
  switch (lineType) {
    case 'h1': return line.replace(/^#\s/, '');
    case 'h2': return line.replace(/^##\s/, '');
    case 'check': return line.replace(/^- \[[ x]\]\s/, '');
    case 'bullet': return line.replace(/^[-*]\s/, '');
    case 'number': return line.replace(/^\d+\.\s/, '');
    case 'quote': return line.replace(/^>\s/, '');
    default: return line;
  }
};

export const getMarkdownPrefix = (type: BlockType, index?: number, checked?: boolean): string => {
  switch (type) {
    case 'h1': return '# ';
    case 'h2': return '## ';
    case 'check-list': return checked ? '- [x] ' : '- [ ] ';
    case 'bullet-list': return '- ';
    case 'number-list': return `${(index || 0) + 1}. `;
    case 'quote': return '> ';
    default: return '';
  }
};
