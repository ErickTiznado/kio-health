import { useState, useRef, useEffect } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { BlockRow, BLOCK_TYPE_OPTIONS, getBlockIcon } from './BlockRow';
import { ListBlock } from './ListBlock';
import type { NoteBlock, BlockType } from './types';
import { isListBlockType } from './types';

interface DraggableBlockItemProps {
  block: NoteBlock;
  // Non-list callbacks
  onChange: (id: string, content: string) => void;
  onChangeType: (id: string, type: BlockType) => void;
  onAddNext: (id: string, type: BlockType) => void;
  onRemove: (id: string) => void;
  isFocused: boolean;
  onFocus: (id: string) => void;
  onMoveFocus: (id: string, direction: 'up' | 'down') => void;
  // List callbacks
  onAddListItem: (blockId: string, afterItemId: string) => string;
  onRemoveListItem: (blockId: string, itemId: string) => void;
  onUpdateListItem: (blockId: string, itemId: string, content: string, checked?: boolean) => void;
  onExitList: (blockId: string) => void;
  // Focus
  focusedItemId?: string | null;
  onFocusItem: (itemId: string) => void;
  // Drag & drop
  onExternalDrop: (e: React.DragEvent, position: 'top' | 'bottom') => void;
  onDragOver: (e: React.DragEvent) => void;
  dropTargetPosition?: 'top' | 'bottom' | null;
}

export function DraggableBlockItem({
  block,
  onChange,
  onChangeType,
  onAddNext,
  onRemove,
  isFocused,
  onFocus,
  onMoveFocus,
  onAddListItem,
  onRemoveListItem,
  onUpdateListItem,
  onExitList,
  focusedItemId,
  onFocusItem,
  onExternalDrop,
  onDragOver,
  dropTargetPosition,
}: DraggableBlockItemProps) {
  const dragControls = useDragControls();
  const isList = isListBlockType(block.type);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const BlockIcon = getBlockIcon(block.type);

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      dragListener={false}
      dragControls={dragControls}
      className="relative"
      onDragOver={onDragOver}
      onDrop={(e) => {
        if (e.dataTransfer.types.includes('block-type') || e.dataTransfer.types.includes('text/plain')) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const mid = (rect.top + rect.bottom) / 2;
          const position = e.clientY < mid ? 'top' : 'bottom';
          onExternalDrop(e, position);
        }
      }}
    >
      {/* Drop Indicator Top */}
      {dropTargetPosition === 'top' && (
        <div className="absolute -top-1 left-0 right-0 h-1 bg-kio rounded-full z-10" />
      )}

      <div className="flex items-center">
        <div className="w-full">
          {isList ? (
            /* ── List block: controls are rendered here, ListBlock handles items ── */
            <div className="group relative pl-18 px-2 py-5 rounded-lg transition-colors duration-200">
              {/* Block Controls (Visible on Hover) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-18 flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">

                {/* Block Type Selector */}
                <div ref={menuRef} className="relative flex items-center">
                  <button
                    onClick={() => setShowTypeMenu(prev => !prev)}
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
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <GripVertical size={18} />
                </div>
              </div>

              <ListBlock
                block={block}
                onAddItem={onAddListItem}
                onRemoveItem={onRemoveListItem}
                onUpdateItem={onUpdateListItem}
                onExitList={onExitList}
                focusedItemId={focusedItemId}
                onFocusItem={onFocusItem}
                onFocusUp={() => onMoveFocus(block.id, 'up')}
                onFocusDown={() => onMoveFocus(block.id, 'down')}
              />
            </div>
          ) : (
            /* ── Regular block ── */
            <BlockRow
              block={block}
              onChange={onChange}
              onChangeType={onChangeType}
              onAddNext={onAddNext}
              onRemove={onRemove}
              isFocused={isFocused}
              onFocus={onFocus}
              onMoveFocus={onMoveFocus}
              dragControls={dragControls}
            />
          )}
        </div>
      </div>

      {/* Drop Indicator Bottom */}
      {dropTargetPosition === 'bottom' && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-kio rounded-full z-10" />
      )}
    </Reorder.Item>
  );
}
