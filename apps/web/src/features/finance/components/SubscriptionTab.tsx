import { useState } from 'react';
import { api } from '../../../lib/api';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@repo/ui/skeleton';

export function SubscriptionTab() {
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions/status');
      return data;
    },
  });

  const handleCheckout = async (priceId: string) => {
    setIsLoadingCheckout(true);
    try {
      const { data } = await api.post('/subscriptions/checkout', {
        priceId,
        successUrl: `${window.location.origin}/finance?checkout=success`,
        cancelUrl: `${window.location.origin}/finance?checkout=cancel`,
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('Error al iniciar el pago.');
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32 w-full" /></div>;
  }

  const isTrialing = status?.status === 'TRIALING';
  const isActive = status?.status === 'ACTIVE';

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-surface dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-kanji dark:text-kio">Tu Suscripción</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Gestiona tu plan y método de pago
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold ${
          isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
          isTrialing ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 
          'bg-red-50 text-red-600 dark:bg-red-900/20'
        }`}>
          {isActive ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {isActive ? 'Activa' : isTrialing ? 'Prueba (Trial)' : 'Inactiva'}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Pro */}
        <div className="border-2 border-kio rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-kio text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            RECOMENDADO
          </div>
          <h3 className="text-2xl font-bold text-kanji dark:text-white mb-2">Plan Pro</h3>
          <p className="text-4xl font-black text-kanji dark:text-white mb-6">
            $29<span className="text-lg text-gray-400 font-medium">/mes</span>
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
              <CheckCircle2 size={16} className="text-kio" /> Pacientes ilimitados
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
              <CheckCircle2 size={16} className="text-kio" /> Agenda inteligente
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
              <CheckCircle2 size={16} className="text-kio" /> Respaldo PWA offline
            </li>
          </ul>
          <button
            disabled={isLoadingCheckout || isActive}
            onClick={() => handleCheckout('price_mock_pro_monthly')}
            className="w-full py-3 rounded-xl font-bold text-white bg-kio hover:bg-kio/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoadingCheckout ? 'Cargando...' : isActive ? 'Plan Actual' : 'Suscribirse al Plan Pro'}
            {!isActive && <CreditCard size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
