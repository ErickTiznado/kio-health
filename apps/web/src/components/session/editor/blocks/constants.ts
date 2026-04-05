import {
  Heading1,
  Heading2,
  Pilcrow,
  List,
  ListOrdered,
  CheckSquare as CheckSquareIcon,
  Quote,
} from 'lucide-react';
import type { BlockType } from './types';

export const BLOCK_TYPE_OPTIONS: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: 'h1', label: 'Título 1', icon: Heading1 },
  { type: 'h2', label: 'Título 2', icon: Heading2 },
  { type: 'paragraph', label: 'Párrafo', icon: Pilcrow },
  { type: 'bullet-list', label: 'Viñeta', icon: List },
  { type: 'number-list', label: 'Numerada', icon: ListOrdered },
  { type: 'check-list', label: 'Checkbox', icon: CheckSquareIcon },
  { type: 'quote', label: 'Cita', icon: Quote },
];

export function getBlockIcon(type: BlockType) {
  const option = BLOCK_TYPE_OPTIONS.find((o) => o.type === type);
  if (!option) return Pilcrow;
  return option.icon;
}