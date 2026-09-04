import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { WidgetError } from './WidgetError';
import { SKELETON_SURFACE } from './WidgetSkeleton';

interface Patient {
  id: string;
  name: string;
  /** Nunca el diagnóstico: ese campo está cifrado y no puede vivir en el dashboard. */
  reason: string | null;
  time: string;
  color: string;
}

interface RecentPatientsWidgetProps {
  patients: Patient[];
  /** Hay entradas guardadas cuyo nombre aún se está hidratando desde la API. */
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

/** Anchos de las filas fantasma; distintos entre sí para que no parezcan clones. */
const SKELETON_WIDTHS = ['w-32', 'w-24', 'w-36'];

/**
 * Cuerpo de la sección RECIENTES, en el raíl.
 *
 * Antes eran mosaicos de 2 columnas con un avatar de 48px y una insignia de
 * tiempo flotando en la esquina — mucha caja para un nombre y una marca de
 * tiempo. Aquí son filas de directorio: inicial, nombre, cuándo. Es material
 * secundario y se comporta como tal.
 */
export function RecentPatientsWidget({ patients, isLoading, isError, onRetry }: RecentPatientsWidgetProps) {
  const navigate = useNavigate();

  if (isError) return <WidgetError what="tus pacientes recientes" onRetry={onRetry} />;

  // La lista se arma con los ids guardados en local y el nombre que llega de la
  // API: mientras esa hidratación está en vuelo, `patients` está vacío y el
  // empty state decía "aparecerán aquí" a alguien que sí tiene recientes.
  if (isLoading) {
    return (
      <div role="status">
        <span className="sr-only">Cargando tus pacientes recientes…</span>
        {SKELETON_WIDTHS.map((w) => (
          <div key={w} className="flex items-center gap-3 py-2">
            <span className={`h-8 w-8 shrink-0 rounded-full ${SKELETON_SURFACE}`} />
            <span className={`h-4 ${w} rounded-full ${SKELETON_SURFACE}`} />
          </div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <p className="py-2 text-xs font-medium text-text-secondary dark:text-slate-400">
        Los pacientes que abras aparecerán aquí.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border dark:divide-slate-800">
      {patients.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => navigate(`/patients/${p.id}`)}
            className="group flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl py-2 pr-2 text-left transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kio dark:hover:bg-slate-800/60"
          >
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${p.color}`}
            >
              {p.name.charAt(0).toUpperCase()}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-text transition-colors group-hover:text-kanji-deep dark:text-white dark:group-hover:text-kio">
                {p.name}
              </span>
              {p.reason && (
                <span className="mt-0.5 block truncate text-xs font-medium text-text-secondary dark:text-slate-400">
                  {p.reason}
                </span>
              )}
            </span>

            <span className="shrink-0 text-[11px] font-bold tabular-nums text-text-secondary dark:text-slate-400">
              {p.time}
            </span>

            <ChevronRight
              size={14}
              aria-hidden="true"
              className="shrink-0 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 dark:text-slate-500"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
