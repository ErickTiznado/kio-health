import { Loader2, CheckCircle2, AlertCircle, CloudOff, Copy, RotateCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'loading' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error?: string | null;
  /** Reintento explícito del último guardado fallido. */
  onRetry?: () => void;
  /** Hay texto escrito que todavía no llegó al servidor. */
  hasOfflineData?: boolean;
  offlineCount?: number;
}

/**
 * Estado del guardado de la nota.
 *
 * El reposo NO es silencio. La versión anterior devolvía `null` en `idle` y el
 * mensaje "Guardado 14:32" se autodestruía a los 3 s, así que lo último que veía
 * quien cierra el portátil con prisa era exactamente nada sobre si su nota
 * estaba a salvo. Aquí el reposo lleva su propia confirmación, discreta pero
 * permanente.
 */
export function SaveStatusIndicator({
  status,
  lastSaved,
  error,
  onRetry,
  hasOfflineData = false,
  offlineCount = 0,
}: SaveStatusIndicatorProps) {
  // El aviso de "sin sincronizar" manda sobre todo lo demás: significa que hay
  // texto clínico que solo existe en este navegador.
  if (hasOfflineData) {
    return (
      <div
        role="status"
        className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
      >
        <CloudOff size={14} aria-hidden="true" />
        <span className="text-xs font-bold">
          Sin sincronizar
          {offlineCount > 1 ? ` · ${offlineCount} notas` : ''}
        </span>
        {/* El área táctil sube a 44px con un pseudo-elemento: la píldora vive en
            la barra de herramientas y estirarla desplazaría toda la fila. */}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="relative ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold underline-offset-2 transition-colors after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:bg-amber-100 hover:underline dark:hover:bg-amber-900/40"
          >
            <RotateCw size={12} aria-hidden="true" />
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (status === 'error') {
    const detail = error || 'El servidor rechazó el guardado.';
    return (
      <div
        role="alert"
        className="flex max-w-full items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
      >
        <AlertCircle size={14} aria-hidden="true" className="shrink-0" />
        {/* El mensaje real del servidor, visible. Escondido en un `title` no
            existe ni en táctil ni con lector de pantalla. */}
        <span className="max-w-[22ch] truncate text-xs font-bold sm:max-w-[36ch]">{detail}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="relative inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold underline-offset-2 transition-colors after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:bg-rose-100 hover:underline dark:hover:bg-rose-900/40"
          >
            <RotateCw size={12} aria-hidden="true" />
            Reintentar
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(detail);
            toast.success('Detalle del error copiado');
          }}
          aria-label="Copiar el detalle del error"
          className="relative inline-flex size-6 items-center justify-center rounded-full transition-colors after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:bg-rose-100 dark:hover:bg-rose-900/40"
        >
          <Copy size={12} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (status === 'saving') {
    return (
      <div role="status" className="flex items-center gap-1.5 text-text-secondary">
        <Loader2 size={14} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
        <span className="text-xs font-medium">Guardando…</span>
      </div>
    );
  }

  if (lastSaved) {
    // `saved` e `idle` comparten mensaje a propósito: el guardado no deja de ser
    // cierto tres segundos después.
    return (
      <div role="status" className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 size={14} aria-hidden="true" />
        <span className="text-xs font-medium">Guardado {format(lastSaved, 'HH:mm')}</span>
      </div>
    );
  }

  // Nada escrito todavía. Decirlo es mejor que no decir nada: la duda "¿esto se
  // guarda solo?" es la razón por la que alguien copia la nota a otro sitio.
  // Va en `text-secondary`, no en `text-muted`: sobre la barra de lino
  // (`bg-surface`, #f5f3ef) el muted medía 2.31:1 y en oscuro 3.70:1 sobre
  // #0f172a. Es el texto que dice si la nota está a salvo; no puede ser el menos
  // legible del componente.
  return (
    <div role="status" className="flex items-center gap-1.5 text-text-secondary">
      <CheckCircle2 size={14} aria-hidden="true" />
      <span className="text-xs font-medium">Se guarda solo</span>
    </div>
  );
}
