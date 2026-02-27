import { useState } from 'react';
import { Reorder } from 'framer-motion';
import { useBlockEditor } from './useBlockEditor';
import { DraggableBlockItem } from './DraggableBlockItem';
import type { BlockType } from './types';
import { isListBlockType } from './types';

interface BlockEditorProps {
  initialContent: string;
  onChange: (markdown: string) => void;
  readOnly?: boolean;
}

export function BlockEditor({ initialContent, onChange, readOnly }: BlockEditorProps) {
  const {
    blocks,
    updateBlock,
    addBlock,
    removeBlock,
    insertBlockAt,
    changeBlockType,
    reorderBlocks,
    addListItem,
    removeListItem,
    updateListItem,
  } = useBlockEditor(initialContent, onChange);

  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: 'top' | 'bottom' } | null>(null);

  const handleMoveFocus = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < blocks.length) {
      const targetBlock = blocks[targetIndex];
      setFocusedBlockId(targetBlock.id);
      setFocusedItemId(null);

      // If moving into a list block, focus appropriate item
      if (isListBlockType(targetBlock.type) && targetBlock.items?.length) {
        if (direction === 'up') {
          // Focus last item
          setFocusedItemId(targetBlock.items[targetBlock.items.length - 1].id);
        } else {
          // Focus first item
          setFocusedItemId(targetBlock.items[0].id);
        }
      }
    }
  };

  const handleExternalDrop = (e: React.DragEvent, index: number, position: 'top' | 'bottom') => {
    e.preventDefault();
    const typeStr = e.dataTransfer.getData('block-type');

    let type: BlockType = 'paragraph';

    if (typeStr) {
      type = typeStr as BlockType;
    }

    const insertIndex = position === 'top' ? index : index + 1;
    insertBlockAt(insertIndex, type);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mid = (rect.top + rect.bottom) / 2;
    const position = e.clientY < mid ? 'top' : 'bottom';
    setDropTarget({ index, position });
  };

  /**
   * When user presses Enter on empty last list item or Backspace on single empty item,
   * exit the list: remove the empty item, convert to paragraph if needed,
   * and create a new paragraph block after.
   */
  const handleExitList = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || !block.items) return;

    if (block.items.length <= 1) {
      // Single empty item → convert entire block to paragraph
      changeBlockType(blockId, 'paragraph');
      setFocusedBlockId(blockId);
      setFocusedItemId(null);
    } else {
      // Remove the last empty item and add a paragraph block after
      const lastItem = block.items[block.items.length - 1];
      removeListItem(blockId, lastItem.id);
      const newId = addBlock(blockId, 'paragraph');
      setFocusedBlockId(newId);
      setFocusedItemId(null);
    }
  };

  if (readOnly) {
    return (
      <div className="space-y-4">
        {blocks.map((b) => (
          <div
            key={b.id}
            className={b.type === 'h1' ? 'text-2xl font-bold' : b.type === 'h2' ? 'text-xl font-bold' : ''}
          >
            {isListBlockType(b.type) && b.items
              ? b.items.map((item, idx) => <div key={item.id}>{`${idx + 1}. ${item.content}`}</div>)
              : b.content}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-[500px] px-6 pb-32" onDragLeave={() => setDropTarget(null)}>
      <Reorder.Group axis="y" values={blocks} onReorder={reorderBlocks} className="space-y-[5px]">
        {blocks.map((block, index) => (
          <DraggableBlockItem
            key={block.id}
            block={block}
            onChange={updateBlock}
            onChangeType={changeBlockType}
            onAddNext={(id, _type) => {
              // For non-list types, create a new block
              const newId = addBlock(id);
              setFocusedBlockId(newId);
              setFocusedItemId(null);
            }}
            onRemove={(id) => {
              const idx = blocks.findIndex((b) => b.id === id);
              // Focus previous block
              if (idx > 0) {
                const prev = blocks[idx - 1];
                setFocusedBlockId(prev.id);
                if (isListBlockType(prev.type) && prev.items?.length) {
                  setFocusedItemId(prev.items[prev.items.length - 1].id);
                } else {
                  setFocusedItemId(null);
                }
              }
              removeBlock(id);
            }}
            isFocused={focusedBlockId === block.id}
            onFocus={(id) => {
              setFocusedBlockId(id);
              setFocusedItemId(null);
            }}
            onMoveFocus={handleMoveFocus}
            // List-specific callbacks
            onAddListItem={addListItem}
            onRemoveListItem={removeListItem}
            onUpdateListItem={updateListItem}
            onExitList={handleExitList}
            focusedItemId={focusedBlockId === block.id ? focusedItemId : null}
            onFocusItem={(itemId) => {
              setFocusedBlockId(block.id);
              setFocusedItemId(itemId);
            }}
            // Drop
            onExternalDrop={(e, pos) => handleExternalDrop(e, index, pos)}
            onDragOver={(e) => handleDragOver(e, index)}
            dropTargetPosition={dropTarget?.index === index ? dropTarget.position : null}
          />
        ))}
      </Reorder.Group>

      {/* Empty area click to add block at end */}
      <div
        className="h-32 cursor-text"
        onClick={() => {
          if (blocks.length > 0) {
            const last = blocks[blocks.length - 1];
            setFocusedBlockId(last.id);
            if (isListBlockType(last.type) && last.items?.length) {
              setFocusedItemId(last.items[last.items.length - 1].id);
            }
          }
        }}
      />
    </div>
  );
}
