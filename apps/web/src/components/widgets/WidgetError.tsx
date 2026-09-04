import { AlertTriangle, RotateCw } from 'lucide-react';

interface WidgetErrorProps {
  /** Qué no se pudo cargar, en lenguaje del usuario. Ej: "tu agenda de hoy". */
  what: string;
  onRetry?: () => void;
  /** `brand` para usarlo sobre el gradiente púrpura del hero. */
  tone?: 'surface' | 'brand';
  className?: string;
}

/**
 * Tercer estado obligatorio de todo widget con datos clínicos.
 *
 * Una superficie que muestra datos clínicos NO puede renderizar su empty state
 * cuando la petición falló: decir "no hay nada" ante un error es afirmar algo
 * falso sobre la agenda o el riesgo de un paciente. Ver DESIGN.md → Do's and Don'ts.
 */
export function WidgetError({ what, onRetry, tone = 'surface', className = '' }: WidgetErrorProps) {
  const isBrand = tone === 'brand';

  return (
    <div
      role="alert"
      className={`flex flex-col items-start gap-3 ${
        isBrand
          ? 'text-white'
          : 'rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-800 dark:bg-amber-950/20'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isBrand ? 'bg-black/25' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
          }`}
        >
          <AlertTriangle size={18} aria-hidden="true" />
        </span>
        <div>
          <p className={`text-sm font-bold ${isBrand ? 'text-white' : 'text-amber-950 dark:text-amber-100'}`}>
            No pudimos cargar {what}
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              isBrand ? 'text-white' : 'text-amber-900/80 dark:text-amber-200/80'
            }`}
          >
            Esto no significa que esté vacío. Vuelve a intentarlo.
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`ml-12 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${
            isBrand
              ? 'bg-black/25 text-white hover:bg-black/40'
              : 'bg-amber-100 text-amber-950 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/60'
          }`}
        >
          <RotateCw size={14} aria-hidden="true" /> Reintentar
        </button>
      )}
    </div>
  );
}
