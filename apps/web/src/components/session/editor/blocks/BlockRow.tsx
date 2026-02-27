import { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {
  GripVertical,
  Heading1,
  Heading2,
  Pilcrow,
  List,
  ListOrdered,
  CheckSquare as CheckSquareIcon,
  Quote,
} from 'lucide-react';
import { DragControls } from 'framer-motion';
import type { NoteBlock, BlockType } from './types';

const BLOCK_TYPE_OPTIONS: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: 'h1', label: 'Título 1', icon: Heading1 },
  { type: 'h2', label: 'Título 2', icon: Heading2 },
  { type: 'paragraph', label: 'Párrafo', icon: Pilcrow },
  { type: 'bullet-list', label: 'Viñeta', icon: List },
  { type: 'number-list', label: 'Numerada', icon: ListOrdered },
  { type: 'check-list', label: 'Checkbox', icon: CheckSquareIcon },
  { type: 'quote', label: 'Cita', icon: Quote },
];

function getBlockIcon(type: BlockType) {
  const option = BLOCK_TYPE_OPTIONS.find((o) => o.type === type);
  if (!option) return Pilcrow;
  return option.icon;
}

interface BlockRowProps {
  block: NoteBlock;
  onChange: (id: string, content: string) => void;
  onChangeType: (id: string, type: BlockType) => void;
  onAddNext: (id: string, type: BlockType) => void;
  onRemove: (id: string) => void;
  isFocused?: boolean;
  onFocus: (id: string) => void;
  onMoveFocus: (id: string, direction: 'up' | 'down') => void;
  placeholder?: string;
  dragControls?: DragControls;
  /** If true, hides the type selector and drag handle (used when rendered inside DraggableBlockItem which provides its own) */
  hideControls?: boolean;
}

export { BLOCK_TYPE_OPTIONS, getBlockIcon };

export function BlockRow({
  block,
  onChange,
  onChangeType,
  onAddNext,
  onRemove,
  isFocused,
  onFocus,
  onMoveFocus,
  placeholder,
  dragControls,
  hideControls,
}: BlockRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused]);

  // Close menu on click outside
  useEffect(() => {
    if (!showTypeMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowTypeMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTypeMenu]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddNext(block.id, block.type);
    }
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onRemove(block.id);
    }
    if (e.key === 'ArrowUp') {
      const input = e.target as HTMLTextAreaElement;
      if (input.selectionStart === 0) {
        e.preventDefault();
        onMoveFocus(block.id, 'up');
      }
    }
    if (e.key === 'ArrowDown') {
      const input = e.target as HTMLTextAreaElement;
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        onMoveFocus(block.id, 'down');
      }
    }
  };

  const getStyles = (type: BlockType) => {
    switch (type) {
      case 'h1':
        return 'text-3xl font-bold text-gray-900 dark:text-white mb-3 mt-6 leading-tight';
      case 'h2':
        return 'text-xl font-bold text-gray-800 dark:text-slate-200 mb-2 mt-4 leading-tight';
      case 'paragraph':
        return 'text-base text-gray-700 dark:text-slate-300 leading-relaxed';
      case 'quote':
        return 'text-base italic text-gray-600 dark:text-slate-400 border-l-4 border-kio/50 pl-4 py-2 my-2 bg-gray-50 dark:bg-slate-800/50 rounded-r';
      default:
        return 'text-base text-gray-700 dark:text-slate-300 leading-relaxed';
    }
  };



  const BlockIcon = getBlockIcon(block.type);

  return (
    <div className="group flex items-start gap-4 relative pl-18 px-2 py-5 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
      {/* Block Controls (Visible on Hover) */}
      {!hideControls && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-18 flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">

          {/* Block Type Selector */}
          <div ref={menuRef} className="relative flex items-center">
            <button
              onClick={() => setShowTypeMenu((prev) => !prev)}
              className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer"
              title="Cambiar tipo de bloque"
            >
              <BlockIcon size={18} />
            </button>

            {showTypeMenu && (
              <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
                {BLOCK_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = block.type === option.type;
                  return (
                    <button
                      key={option.type}
                      onClick={() => {
                        onChangeType(block.id, option.type);
                        setShowTypeMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${isActive
                        ? 'bg-kio/10 text-kio dark:bg-kio/20'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                    >
                      <Icon size={14} />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drag Handle */}
          <div
            className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            onPointerDown={(e) => {
              e.preventDefault();
              dragControls?.start(e);
            }}
          >
            <GripVertical size={18} />
          </div>
        </div>
      )}

      {/* Content Input */}
      <TextareaAutosize
        ref={textareaRef}
        value={block.content}
        onChange={(e) => onChange(block.id, e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => onFocus(block.id)}
        placeholder={
          placeholder ||
          (block.type === 'paragraph'
            ? 'Escribe algo...'
            : `Texto ${block.type}...`)
        }
        className={`flex-1 w-full bg-transparent resize-none outline-none placeholder:text-gray-300 dark:placeholder:text-slate-700 ${getStyles(block.type)}`}
      />
    </div>
  );
}
