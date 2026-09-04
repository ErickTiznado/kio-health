import { Lock } from 'lucide-react';

/**
 * Tratamiento visual de lo confidencial.
 *
 * `PsychNote.privateNotes` y las notas privadas de un anexo van cifradas igual
 * que el resto, pero además no se comparten: no salen en el PDF que se exporta
 * desde la sesión. Hasta ahora el campo iba estilizado idéntico al contenido
 * compartido —mismo fondo, mismo borde—, de modo que nada en pantalla decía
 * qué se va a ver fuera y qué no. Aquí la superficie está hundida en gris
 * pizarra en vez de elevada en blanco: se lee como un cajón cerrado.
 */
export const PRIVATE_SURFACE_CLASS =
  'border-slate-300 bg-slate-100/80 text-slate-800 placeholder:text-slate-400 ' +
  'dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200 dark:placeholder:text-slate-600';

interface PrivateNoteFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  rows?: number;
  /** Encabezado visible. Por defecto, "Notas privadas". */
  title?: string;
  className?: string;
}

export function PrivateNoteField({
  id,
  value,
  onChange,
  readOnly = false,
  placeholder = 'Hipótesis, contratransferencia, lo que no va en el informe…',
  rows = 4,
  title = 'Notas privadas',
  className = '',
}: PrivateNoteFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
      >
        <Lock size={14} aria-hidden="true" />
        {title}
      </label>

      <textarea
        id={id}
        rows={rows}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder={readOnly ? undefined : placeholder}
        className={`w-full resize-y rounded-md border px-3.5 py-2.5 text-sm font-medium leading-relaxed outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-400/30 read-only:cursor-default dark:focus:border-slate-500 dark:focus:ring-slate-500/30 ${PRIVATE_SURFACE_CLASS}`}
      />

      <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        Solo para ti. No se incluyen en el PDF que exportas desde la sesión.
      </p>
    </div>
  );
}
