import { useCallback, useLayoutEffect, useRef } from 'react';
import { EyeOff } from 'lucide-react';

import { MarkdownPreview } from '../../ui/MarkdownPreview';
import { useSettingsStore } from '../../../stores/settings.store';

interface ProseEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  /** Nombre accesible del campo. Obligatorio: no hay `<label>` visible. */
  label: string;
  /** Ctrl/Cmd + S — escribir ya, sin esperar al autoguardado. */
  onSave?: () => void;
  /** Ctrl/Cmd + Enter — cerrar la sesión. */
  onFinish?: () => void;
  /** Alt + ↑ / ↓ — saltar de sección (SOAP). */
  onSection?: (direction: 'prev' | 'next') => void;
  autoFocus?: boolean;
}

/**
 * Superficie de prosa clínica.
 *
 * Sustituye al editor de bloques. Escribir una nota de sesión no es componer un
 * documento: arrastrar y soltar, siete tipos de bloque y un rail de agarre en
 * hover resuelven un problema que nadie tiene a las 15:52 entre pacientes, y
 * obligan a pensar en ESTRUCTURA justo cuando hay que descargar una hora
 * emocionalmente pesada.
 *
 * El formato persistido no cambia: la nota se guardaba ya como markdown en
 * texto plano (`content.body`, `content.s|o|a|p`) y los bloques solo eran una
 * lectura en memoria de ese markdown. Lo que se escribió con el editor de
 * bloques se lee y se edita aquí tal cual, sin migración ni conversión.
 */

/** Prefijos de lista/cita que se continúan solos al pulsar Enter. */
const LIST_PREFIX = /^([ \t]*)(-\s\[[ xX]\]\s|[-*]\s|\d+\.\s|>\s)/;

export function ProseEditor({
  value,
  onChange,
  readOnly,
  placeholder,
  label,
  onSave,
  onFinish,
  onSection,
  autoFocus,
}: ProseEditorProps) {
  const isDiscreteMode = useSettingsStore((s) => s.isDiscreteMode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /** Cursor pendiente de restaurar tras una edición hecha a mano. */
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCaret.current === null) return;
    const el = textareaRef.current;
    if (el) el.setSelectionRange(pendingCaret.current, pendingCaret.current);
    pendingCaret.current = null;
  });

  /**
   * Reemplaza un tramo del texto. Se intenta primero con `insertText` para no
   * romper la pila de deshacer del navegador — en una nota clínica, perder
   * Ctrl+Z es perder trabajo. Si el navegador no lo soporta, se hace a mano y
   * se restaura el cursor en el layout effect de arriba.
   */
  const replaceRange = useCallback(
    (start: number, end: number, text: string) => {
      const el = textareaRef.current;
      if (!el) return;

      el.focus();
      el.setSelectionRange(start, end);

      let inserted = false;
      try {
        inserted = document.execCommand('insertText', false, text);
      } catch {
        inserted = false;
      }
      if (inserted) return;

      const next = el.value.slice(0, start) + text + el.value.slice(end);
      pendingCaret.current = start + text.length;
      onChange(next);
    },
    [onChange],
  );

  /** Envuelve la selección en un marcador markdown (negrita, cursiva). */
  const wrapSelection = useCallback(
    (marker: string) => {
      const el = textareaRef.current;
      if (!el) return;
      const { selectionStart: start, selectionEnd: end } = el;
      const selected = el.value.slice(start, end);
      replaceRange(start, end, `${marker}${selected}${marker}`);
      if (start === end) {
        // Sin selección: dejar el cursor entre los marcadores.
        pendingCaret.current = start + marker.length;
        requestAnimationFrame(() => {
          const node = textareaRef.current;
          if (node) node.setSelectionRange(start + marker.length, start + marker.length);
        });
      }
    },
    [replaceRange],
  );

  const handleEnter = useCallback(
    (el: HTMLTextAreaElement): boolean => {
      const caret = el.selectionStart;
      if (caret !== el.selectionEnd) return false;

      const lineStart = el.value.lastIndexOf('\n', caret - 1) + 1;
      const lineToCaret = el.value.slice(lineStart, caret);
      const match = lineToCaret.match(LIST_PREFIX);
      if (!match) return false;

      const [, indent, marker] = match;

      // Enter sobre un ítem vacío: salir de la lista en vez de encadenar
      // viñetas huérfanas.
      if (lineToCaret.trim() === marker.trim()) {
        replaceRange(lineStart, caret, indent);
        return true;
      }

      // Continuar la lista. En las numeradas, avanzar el número.
      const ordered = marker.match(/^(\d+)\.\s$/);
      const nextMarker = ordered
        ? `${Number(ordered[1]) + 1}. `
        : marker.replace(/\[[xX]\]/, '[ ]');

      replaceRange(caret, caret, `\n${indent}${nextMarker}`);
      return true;
    },
    [replaceRange],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = event.metaKey || event.ctrlKey;

      if (mod && event.key.toLowerCase() === 's') {
        event.preventDefault();
        onSave?.();
        return;
      }

      if (mod && event.key === 'Enter') {
        event.preventDefault();
        onFinish?.();
        return;
      }

      if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        if (!onSection) return;
        event.preventDefault();
        onSection(event.key === 'ArrowUp' ? 'prev' : 'next');
        return;
      }

      if (mod && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        wrapSelection('**');
        return;
      }

      if (mod && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        wrapSelection('*');
        return;
      }

      if (event.key === 'Enter' && !event.shiftKey && !mod) {
        if (handleEnter(event.currentTarget)) event.preventDefault();
      }
    },
    [handleEnter, onFinish, onSave, onSection, wrapSelection],
  );

  if (readOnly) {
    return (
      <div className="h-full overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-[68ch]">
          {value.trim() ? (
            <MarkdownPreview content={value} />
          ) : (
            <p className="text-sm italic text-text-muted">
              Esta nota se cerró sin contenido.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group/discrete relative h-full">
      <div
        className={`h-full overflow-y-auto transition-[filter] duration-300 ${
          isDiscreteMode
            ? 'blur-sm select-none focus-within:select-auto focus-within:blur-none'
            : ''
        }`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          aria-label={label}
          autoFocus={autoFocus}
          spellCheck
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="mx-auto block h-full w-full max-w-[68ch] resize-none bg-transparent px-6 py-8 text-base leading-relaxed text-text outline-none placeholder:text-text-muted"
        />
      </div>

      {/* El desenfoque sin explicación se lee como un fallo de render. */}
      {isDiscreteMode && (
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center group-focus-within/discrete:hidden">
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary shadow-sm">
            <EyeOff size={14} aria-hidden="true" />
            Modo discreto · escribe para revelar
          </span>
        </div>
      )}
    </div>
  );
}
