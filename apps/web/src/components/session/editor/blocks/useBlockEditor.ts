import { useState, useRef, useEffect } from 'react';
import type { NoteBlock, BlockType, ListItem } from './types';
import {
  detectLineType,
  cleanLineContent,
  lineTypeToBlockType,
  getMarkdownPrefix,
  isListBlockType,
} from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useBlockEditor(initialMarkdown: string = '', onChange?: (markdown: string) => void) {
  const [blocks, setBlocks] = useState<NoteBlock[]>([]);
  const isInitialized = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // ── Initialize from Markdown ──────────────────────────────────────
  useEffect(() => {
    if (isInitialized.current) return;

    if (!initialMarkdown) {
      setBlocks([{ id: generateId(), type: 'paragraph', content: '' }]);
      isInitialized.current = true;
      return;
    }

    const lines = initialMarkdown.split('\n');
    const newBlocks: NoteBlock[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // Skip empty lines
      if (line.trim() === '') {
        i++;
        continue;
      }

      const lineType = detectLineType(line);
      const blockType = lineTypeToBlockType(lineType);

      // If it's a list type, group consecutive lines of the same type
      if (isListBlockType(blockType)) {
        const items: ListItem[] = [];

        while (i < lines.length) {
          const currentLine = lines[i];
          if (currentLine.trim() === '') break;

          const currentLineType = detectLineType(currentLine);
          const currentBlockType = lineTypeToBlockType(currentLineType);
          if (currentBlockType !== blockType) break;

          const content = cleanLineContent(currentLine, currentLineType);
          const checked = blockType === 'check-list' && currentLine.startsWith('- [x]');

          items.push({
            id: generateId(),
            content,
            checked: blockType === 'check-list' ? checked : undefined,
          });
          i++;
        }

        newBlocks.push({
          id: generateId(),
          type: blockType,
          content: '',
          items,
        });
      } else {
        // Non-list block
        const content = cleanLineContent(line, lineType);
        newBlocks.push({
          id: generateId(),
          type: blockType,
          content,
        });
        i++;
      }
    }

    if (newBlocks.length === 0) {
      newBlocks.push({ id: generateId(), type: 'paragraph', content: '' });
    }

    setBlocks(newBlocks);
    isInitialized.current = true;
  }, [initialMarkdown]);

  // ── Sync to parent (Markdown Export) ──────────────────────────────
  useEffect(() => {
    if (!isInitialized.current) return;

    const parts: string[] = [];

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      if (isListBlockType(b.type) && b.items && b.items.length > 0) {
        // Export each item as a markdown line, single newline between items
        const listLines = b.items.map((item, idx) => {
          const prefix = getMarkdownPrefix(b.type, idx, item.checked);
          return `${prefix}${item.content}`;
        }).join('\n');

        if (i === 0) {
          parts.push(listLines);
        } else {
          parts.push('\n\n' + listLines);
        }
      } else {
        const prefix = getMarkdownPrefix(b.type);
        const line = `${prefix}${b.content}`;

        if (i === 0) {
          parts.push(line);
        } else {
          parts.push('\n\n' + line);
        }
      }
    }

    const markdown = parts.join('');
    if (onChangeRef.current) {
      onChangeRef.current(markdown);
    }
  }, [blocks]);

  // ── Block Actions ─────────────────────────────────────────────────
  const updateBlock = (id: string, content: string, checked?: boolean) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content, checked: checked ?? b.checked } : b));
  };

  const addBlock = (afterId: string, type: BlockType = 'paragraph') => {
    const newBlock: NoteBlock = isListBlockType(type)
      ? { id: generateId(), type, content: '', items: [{ id: generateId(), content: '' }] }
      : { id: generateId(), type, content: '' };

    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === afterId);
      if (index === -1) return [...prev, newBlock];
      const newArr = [...prev];
      newArr.splice(index + 1, 0, newBlock);
      return newArr;
    });
    return newBlock.id;
  };

  const insertBlockAt = (index: number, type: BlockType = 'paragraph') => {
    const newBlock: NoteBlock = isListBlockType(type)
      ? { id: generateId(), type, content: '', items: [{ id: generateId(), content: '' }] }
      : { id: generateId(), type, content: '' };

    setBlocks(prev => {
      const newArr = [...prev];
      newArr.splice(index, 0, newBlock);
      return newArr;
    });
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => {
      if (prev.length <= 1) return [{ ...prev[0], content: '', items: undefined }];
      return prev.filter(b => b.id !== id);
    });
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    setBlocks(prev => {
      const newArr = [...prev];
      const [moved] = newArr.splice(fromIndex, 1);
      newArr.splice(toIndex, 0, moved);
      return newArr;
    });
  };

  const changeBlockType = (id: string, newType: BlockType) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b;

      const wasListBlock = isListBlockType(b.type);
      const isNowListBlock = isListBlockType(newType);

      // Non-list → List: convert content to single item
      if (!wasListBlock && isNowListBlock) {
        return {
          ...b,
          type: newType,
          items: [{ id: generateId(), content: b.content, checked: newType === 'check-list' ? false : undefined }],
          content: '',
        };
      }

      // List → Non-list: flatten items into content
      if (wasListBlock && !isNowListBlock) {
        const flatContent = b.items?.map(it => it.content).join('\n') || b.content;
        return {
          ...b,
          type: newType,
          content: flatContent,
          items: undefined,
        };
      }

      // List → List (different kind): preserve items, update checked field
      if (wasListBlock && isNowListBlock) {
        return {
          ...b,
          type: newType,
          items: b.items?.map(it => ({
            ...it,
            checked: newType === 'check-list' ? (it.checked ?? false) : undefined,
          })),
        };
      }

      // Non-list → Non-list
      return { ...b, type: newType };
    }));
  };

  const reorderBlocks = (newBlocks: NoteBlock[]) => {
    setBlocks(newBlocks);
  };

  // ── List Item Actions ─────────────────────────────────────────────
  const addListItem = (blockId: string, afterItemId: string): string => {
    const newItemId = generateId();
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId || !b.items) return b;
      const idx = b.items.findIndex(it => it.id === afterItemId);
      const newItem: ListItem = {
        id: newItemId,
        content: '',
        checked: b.type === 'check-list' ? false : undefined,
      };
      const newItems = [...b.items];
      newItems.splice(idx + 1, 0, newItem);
      return { ...b, items: newItems };
    }));
    return newItemId;
  };

  const removeListItem = (blockId: string, itemId: string) => {
    setBlocks(prev => {
      return prev.map(b => {
        if (b.id !== blockId || !b.items) return b;

        // If it's the last item, convert to empty paragraph
        if (b.items.length <= 1) {
          return { ...b, type: 'paragraph' as BlockType, content: '', items: undefined };
        }

        return { ...b, items: b.items.filter(it => it.id !== itemId) };
      });
    });
  };

  const updateListItem = (blockId: string, itemId: string, content: string, checked?: boolean) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId || !b.items) return b;
      return {
        ...b,
        items: b.items.map(it =>
          it.id === itemId ? { ...it, content, checked: checked ?? it.checked } : it
        ),
      };
    }));
  };

  return {
    blocks,
    updateBlock,
    addBlock,
    insertBlockAt,
    removeBlock,
    moveBlock,
    changeBlockType,
    reorderBlocks,
    // List item actions
    addListItem,
    removeListItem,
    updateListItem,
  };
}
