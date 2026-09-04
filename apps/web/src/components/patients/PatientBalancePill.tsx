import { Link } from 'react-router-dom';
import { AlertTriangle, HandCoins, RotateCw, WifiOff } from 'lucide-react';
import { useOutstanding } from '../../features/finance/api/useFinanceSummary';
import { formatMoney } from '../../features/finance/money';
import { useAuthStore } from '../../stores/auth.store';

interface PatientBalancePillProps {
  patientId: string;
  /** Solo para el `aria-label`: "Saldo pendiente de Ana Ruiz…". */
  patientName: string;
}

/**
 * Saldo pendiente del paciente, en la cabecera de su expediente.
 *
 * "Por cobrar" enlazaba AL paciente desde Finanzas, pero el expediente no
 * sabía decir la deuda por la que se acababa de hacer clic. El dato vive en
 * `GET /finance/outstanding` (agregado por paciente); aquí se reutiliza el
 * MISMO hook y la MISMA caché que usan `OutstandingCard` y `PorCobrarTab`, de
 * modo que abrir la ficha no dispara una petición extra si Finanzas ya la
 * trajo, y cobrar en Finanzas actualiza esta pastilla sin recargar.
 *
 * Honestidad clínica: el error va ANTES del vacío y la carga va ANTES del
 * vacío. Si `/finance/outstanding` falla, esta cabecera NO puede quedarse
 * callada: el silencio aquí se lee como "no debe nada", que es exactamente la
 * afirmación que hace que el clínico deje de perseguir un cobro real. Por eso
 * el fallo pinta un aviso con reintento, y no la ausencia de pastilla.
 *
 * El tercer estado que NO se puede pintar como vacío es la consulta PAUSADA:
 * con `networkMode: 'online'` (el de fábrica, no se toca en `main.tsx`) y sin
 * red, React Query deja `status: 'pending'` con `fetchStatus: 'paused'`, así
 * que `isLoading` (= isPending && isFetching) e `isError` son AMBOS falsos. Sin
 * esta rama la pastilla desaparecía en silencio justo cuando entramos a la
 * ficha con el paciente ya en caché y la red caída. `use-dashboard-data.ts` ya
 * trata `isPaused` como estado propio.
 */
export function PatientBalancePill({ patientId, patientName }: PatientBalancePillProps) {
  const currency = useAuthStore((s) => s.user?.profile?.currency ?? 'USD');
  const { data, isLoading, isError, isPaused, refetch } = useOutstanding();

  // Zona de toque de 44px sin engordar la pastilla: la fila de la cabecera ya
  // mide 44px (la lleva el enlace de "Expediente cifrado"), así que el
  // pseudo-elemento no cambia el alto de nada.
  const touchTarget =
    "after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']";

  if (isError) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        className={`relative inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-900 ring-1 ring-amber-600/20 transition-colors duration-150 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/25 dark:hover:bg-amber-500/20 ${touchTarget}`}
      >
        <AlertTriangle size={13} aria-hidden="true" />
        Saldo no disponible
        <RotateCw size={12} aria-hidden="true" />
        <span className="sr-only">
          No pudimos cargar el saldo pendiente de {patientName}. Esto no significa que no
          deba nada. Reintentar.
        </span>
      </button>
    );
  }

  // Pausada y sin nada en caché: no sabemos el saldo. Se pinta como aviso, no
  // como ausencia. No lleva botón de reintento porque sin red el reintento
  // volvería a pausarse sin cambiar nada visible: se recupera solo al volver la
  // conexión. Si SÍ hay datos en caché seguimos por el camino normal y se
  // muestra la última cifra conocida, que es más honesto que esconderla.
  if (isPaused && !data) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-900 ring-1 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/25">
        <WifiOff size={13} aria-hidden="true" />
        Sin conexión · saldo no disponible
        <span className="sr-only">
          No pudimos cargar el saldo pendiente de {patientName} porque no hay conexión. Esto
          no significa que no deba nada. Se cargará al recuperar la red.
        </span>
      </span>
    );
  }

  if (isLoading) {
    return (
      <span
        aria-busy="true"
        className="relative inline-flex items-center rounded-full bg-cruz/40 px-3 py-1 dark:bg-slate-800"
      >
        <span aria-hidden="true" className="block h-3 w-24 animate-pulse rounded-full bg-cruz/60 dark:bg-slate-700" />
        <span className="sr-only">Cargando saldo pendiente de {patientName}</span>
      </span>
    );
  }

  const entry = data?.data.find((e) => e.patientId === patientId);
  // Sin deuda: no se pinta nada. La ausencia de pastilla no afirma nada, y el
  // caso en el que no lo sabemos (error) ya tiene su propia superficie arriba.
  if (!entry || entry.total <= 0) return null;

  const money = formatMoney(entry.total, currency);
  const sessions = entry.sessions === 1 ? '1 sesión' : `${entry.sessions} sesiones`;

  return (
    <Link
      to="/finance?tab=por-cobrar"
      // Ámbar es "pendiente", no "peligro": una deuda no es una bandera de
      // riesgo y no puede vestirse de rose. `amber-800` sobre `amber-50` mide
      // ~6.9:1; `amber-600` se quedaba en 2.87:1 para una cifra de dinero.
      className={`relative inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold tabular-nums text-amber-800 ring-1 ring-amber-600/20 transition-colors duration-150 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25 dark:hover:bg-amber-500/20 ${touchTarget}`}
      aria-label={`Saldo pendiente de ${patientName}: ${money} en ${sessions}. Ver en por cobrar.`}
    >
      <HandCoins size={13} aria-hidden="true" />
      <span aria-hidden="true">
        {money} por cobrar · {sessions}
      </span>
    </Link>
  );
}
