import { Link } from 'react-router-dom';
import { AlertTriangle, Clock } from 'lucide-react';
import { useTrial } from '../../hooks/use-trial';

/**
 * Aviso del estado de la prueba.
 *
 * CALLADO HASTA QUE IMPORTA. No se pinta nada durante los primeros ocho días:
 * un contador desde el minuto uno convierte la prueba en una cuenta atrás
 * ansiosa, que es justo lo contrario de dejar que alguien evalúe la
 * herramienta con calma. Aparece a falta de una semana y cambia de tono al
 * caducar.
 *
 * El caso de bloqueo duro no llega hasta aquí: `RequireAuth` manda a `/plan`
 * antes de montar el layout, así que este componente solo cubre "queda poco" y
 * "solo lectura".
 */
export function TrialBanner() {
  const trial = useTrial();

  if (trial.isHardLocked) return null;
  if (!trial.isEndingSoon && !trial.isExpired) return null;

  if (trial.isExpired) {
    return (
      <div
        role="status"
        className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-900/20"
      >
        <AlertTriangle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
        <p className="flex-1 text-sm font-medium text-rose-700 dark:text-rose-300">
          <strong className="font-bold">Tu prueba terminó.</strong>{' '}
          Puedes consultar todo, pero no guardar cambios hasta elegir un plan.
        </p>
        <Link
          to="/plan"
          className="flex min-h-11 shrink-0 items-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition-all duration-150 hover:bg-rose-700 active:scale-95"
        >
          Elegir plan
        </Link>
      </div>
    );
  }

  const dias = trial.daysRemaining ?? 0;
  const texto =
    dias === 0
      ? 'Hoy es el último día de tu prueba.'
      : `Te ${dias === 1 ? 'queda' : 'quedan'} ${dias} ${dias === 1 ? 'día' : 'días'} de prueba.`;

  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-900/10"
    >
      <Clock size={16} className="shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium text-amber-700 dark:text-amber-300">
        <strong className="font-bold">{texto}</strong> Sin prisa — cuando quieras lo cerramos.
      </p>
      <Link
        to="/plan"
        className="flex min-h-11 shrink-0 items-center rounded-xl border border-amber-300 bg-white px-4 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
      >
        Elegir plan
      </Link>
    </div>
  );
}
