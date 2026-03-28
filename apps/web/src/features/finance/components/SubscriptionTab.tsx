import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { api } from '../../../lib/api';

// NOTE: Stripe integration removed.
// This tab now shows the current subscription status from the DB only.
// A new payment provider (e.g. Wompi) should be wired here when ready.

export function SubscriptionTab() {
  const { data: status, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions/status');
      return data;
    },
  });

  const isActive = status?.status === 'ACTIVE';
  const isTrialing = status?.status === 'TRIALING';

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-surface dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-kanji dark:text-kio">Tu Suscripción</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Estado de tu plan actual
          </p>
        </div>

        {!isLoading && (
          <div
            className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold ${
              isActive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                : isTrialing
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {isActive ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {isActive ? 'Activa' : isTrialing ? 'Período de prueba' : 'Inactiva'}
          </div>
        )}
      </div>

      {/* Plan info */}
      {status?.plan && (
        <div className="mb-8 p-5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Plan actual</p>
          <p className="text-lg font-bold text-kanji dark:text-white">{status.plan.name}</p>
          {status.currentPeriodEnd && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              Válido hasta:{' '}
              {new Date(status.currentPeriodEnd).toLocaleDateString('es', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      )}

      {/* Payment placeholder */}
      <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center">
        <CreditCard size={36} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
        <h3 className="text-base font-bold text-gray-500 dark:text-slate-400 mb-2">
          Gestión de pagos próximamente
        </h3>
        <p className="text-sm text-gray-400 dark:text-slate-500 max-w-sm mx-auto">
          La integración con la pasarela de pagos está en configuración.
          Contacta a soporte para cambios de plan.
        </p>
      </div>
    </div>
  );
}
