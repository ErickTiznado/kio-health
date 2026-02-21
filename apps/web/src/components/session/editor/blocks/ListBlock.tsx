import { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Square, CheckSquare } from 'lucide-react';
import type { NoteBlock, ListItem } from './types';

interface ListBlockProps {
    block: NoteBlock;
    onAddItem: (blockId: string, afterItemId: string) => string;
    onRemoveItem: (blockId: string, itemId: string) => void;
    onUpdateItem: (blockId: string, itemId: string, content: string, checked?: boolean) => void;
    onExitList: (blockId: string) => void;
    focusedItemId?: string | null;
    onFocusItem: (itemId: string) => void;
    onFocusUp: () => void;
    onFocusDown: () => void;
}

export function ListBlock({
    block,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
    onExitList,
    focusedItemId,
    onFocusItem,
    onFocusUp,
    onFocusDown,
}: ListBlockProps) {
    const items = block.items || [];
    const itemRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());
    const [pendingFocus, setPendingFocus] = useState<string | null>(null);

    // Focus management
    useEffect(() => {
        const targetId = pendingFocus || focusedItemId;
        if (targetId) {
            const el = itemRefs.current.get(targetId);
            if (el) {
                el.focus();
                // Place cursor at end
                const len = el.value.length;
                el.setSelectionRange(len, len);
            }
            if (pendingFocus) setPendingFocus(null);
        }
    }, [focusedItemId, pendingFocus, items.length]);

    const handleKeyDown = (e: React.KeyboardEvent, item: ListItem, index: number) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            // Empty item at the end → exit list, create paragraph after
            if (item.content === '' && index === items.length - 1) {
                onExitList(block.id);
                return;
            }

            // Add new item after this one
            const newId = onAddItem(block.id, item.id);
            setPendingFocus(newId);
        }

        if (e.key === 'Backspace' && item.content === '') {
            e.preventDefault();

            if (items.length <= 1) {
                // Last item empty → convert block to paragraph
                onExitList(block.id);
                return;
            }

            // Focus the previous item before removing
            if (index > 0) {
                setPendingFocus(items[index - 1].id);
            }
            onRemoveItem(block.id, item.id);
        }

        if (e.key === 'ArrowUp') {
            const input = e.target as HTMLTextAreaElement;
            if (input.selectionStart === 0) {
                e.preventDefault();
                if (index > 0) {
                    onFocusItem(items[index - 1].id);
                    setPendingFocus(items[index - 1].id);
                } else {
                    onFocusUp();
                }
            }
        }

        if (e.key === 'ArrowDown') {
            const input = e.target as HTMLTextAreaElement;
            if (input.selectionStart === input.value.length) {
                e.preventDefault();
                if (index < items.length - 1) {
                    onFocusItem(items[index + 1].id);
                    setPendingFocus(items[index + 1].id);
                } else {
                    onFocusDown();
                }
            }
        }
    };

    const getIndicator = (item: ListItem, index: number) => {
        switch (block.type) {
            case 'bullet-list':
                return (
                    <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500 shrink-0" />
                );
            case 'number-list':
                return (
                    <span className="mt-1.5 text-sm font-medium text-gray-400 dark:text-slate-500 shrink-0 min-w-[1.25rem] text-right select-none">
                        {index + 1}.
                    </span>
                );
            case 'check-list':
                return (
                    <button
                        onClick={() => onUpdateItem(block.id, item.id, item.content, !item.checked)}
                        className="mt-1 text-gray-400 dark:text-slate-500 hover:text-kio transition-colors shrink-0"
                    >
                        {item.checked ? (
                            <CheckSquare size={18} className="text-emerald-500" />
                        ) : (
                            <Square size={18} />
                        )}
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50/60 dark:bg-slate-800/30 rounded-lg">
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className="flex items-start gap-3 px-3 py-0.5"
                >
                    {getIndicator(item, index)}
                    <TextareaAutosize
                        ref={(el) => {
                            if (el) itemRefs.current.set(item.id, el);
                            else itemRefs.current.delete(item.id);
                        }}
                        value={item.content}
                        onChange={(e) => onUpdateItem(block.id, item.id, e.target.value, item.checked)}
                        onKeyDown={(e) => handleKeyDown(e, item, index)}
                        onFocus={() => onFocusItem(item.id)}
                        placeholder={index === 0 ? 'Elemento de lista...' : ''}
                        className="flex-1 w-full bg-transparent resize-none outline-none text-base text-gray-700 dark:text-slate-300 leading-relaxed placeholder:text-gray-300 dark:placeholder:text-slate-700"
                    />
                </div>
            ))}
        </div>
    );
}
