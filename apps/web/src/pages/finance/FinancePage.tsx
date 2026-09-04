import { useEffect, useRef, useState, type ElementType } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFinanceSummary } from '../../features/finance/api/useFinanceSummary';
import { BalanceChart } from '../../features/finance/components/BalanceChart';
import { TransactionModal } from '../../features/finance/components/TransactionModal';
import { PaymentMethodCard } from '../../features/finance/components/PaymentMethodCard';
import { OutstandingCard } from '../../features/finance/components/OutstandingCard';
import { MovimientosTab } from '../../features/finance/components/MovimientosTab';
import { PorCobrarTab } from '../../features/finance/components/PorCobrarTab';
import { SubscriptionTab } from '../../features/finance/components/SubscriptionTab';
import { useFinanceTimeZone } from '../../features/finance/dates';
import { formatMoney } from '../../features/finance/money';
import { DashboardLayout } from '../../components/DashboardLayout';
import { WidgetError } from '../../components/widgets/WidgetError';
import { useAuthStore } from '../../stores/auth.store';
import { format, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Skeleton } from '@repo/ui/skeleton';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Orden deliberado: "por cobrar" es la pregunta con la que el psicólogo entra
 * a Finanzas ("¿quién me debe?"), así que va antes del libro de movimientos.
 * El id es también el valor del parámetro `?tab=` de la URL.
 */
const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'por-cobrar', label: 'Por cobrar' },
  { id: 'movimientos', label: 'Movimientos' },
  { id: 'suscripcion', label: 'Suscripción' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default function FinancePage() {
  useDocumentTitle('Finanzas');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE' | null>(null);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const currency = useAuthStore((s) => s.user?.profile?.currency ?? 'USD');
  const timeZone = useFinanceTimeZone();

  // La pestaña vive en la URL: recargar, compartir el enlace o volver atrás
  // aterriza donde estabas, no siempre en Resumen.
  const tabParam = searchParams.get('tab');
  const activeTab: TabId = TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : 'resumen';

  const selectTab = (id: TabId) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'resumen') next.delete('tab');
    else next.set('tab', id);
    setSearchParams(next, { replace: true });
  };

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const { data, isLoading, isError, refetch } = useFinanceSummary(month, year);

  // La navegación de mes no corre hacia un futuro que no existe: no hay
  // movimientos después del mes en curso.
  const now = new Date();
  const isAtCurrentMonth =
    selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth();

  const handlePrevMonth = () => setSelectedDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () =>
    setSelectedDate((prev) => (isAtCurrentMonth ? prev : addMonths(prev, 1)));

  const incomeDelta = data ? calcDelta(data.totalIncome, data.previousMonth.totalIncome) : null;
  const expenseDelta = data ? calcDelta(data.totalExpense, data.previousMonth.totalExpense) : null;
  const balanceDelta = data ? calcDelta(data.balance, data.previousMonth.balance) : null;

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = TABS.length - 1;
    if (nextIndex === null) return;

    e.preventDefault();
    const next = TABS[nextIndex];
    selectTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  useEffect(() => {
    if (!isCreateMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!createMenuRef.current?.contains(e.target as Node)) setIsCreateMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCreateMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isCreateMenuOpen]);

  const openTransactionModal = (type: 'INCOME' | 'EXPENSE') => {
    setIsCreateMenuOpen(false);
    setTransactionType(type);
  };

  const panelProps = (id: TabId) => ({
    id: `finance-panel-${id}`,
    role: 'tabpanel' as const,
    'aria-labelledby': `finance-tab-${id}`,
    tabIndex: 0,
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          // Sin `backdrop-blur`: el blur está reservado al overlay de modal y al
          // omnibox. Un encabezado pegajoso se separa con borde, y para eso la
          // superficie tiene que ser opaca, no un 80% que deja transparentar la
          // tabla al pasar por debajo.
          className="relative z-30 bg-surface dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-8 pt-6 pb-0">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-kanji-deep dark:text-kio tracking-tight">Finanzas</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium first-letter:uppercase">
                {format(selectedDate, 'MMMM yyyy', { locale: es })}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Navegación de mes */}
              <div className="flex items-center gap-1 bg-surface dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm p-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Mes anterior"
                  className="grid h-11 w-11 place-items-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-kanji-deep dark:text-kio transition-colors duration-150"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <span className="px-4 text-xs font-bold text-kanji-deep dark:text-kio select-none min-w-[100px] text-center first-letter:uppercase">
                  {format(selectedDate, 'MMMM', { locale: es })}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={isAtCurrentMonth}
                  aria-label="Mes siguiente"
                  className="grid h-11 w-11 place-items-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-kanji-deep dark:text-kio transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>

              {isLoading && (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin text-kanji-deep dark:text-kio opacity-50"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Cargando finanzas del mes</span>
                </>
              )}

              {/* Registrar movimiento: gasto O ingreso. Cobrar una sesión no
                  pasa por aquí — se hace en "Por cobrar". */}
              <div className="relative" ref={createMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsCreateMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={isCreateMenuOpen}
                  // Kanji Hondo: `bg-kio` con texto blanco mide 2.2:1.
                  className="bg-kanji-deep hover:bg-kanji-deep/90 text-white px-5 min-h-11 rounded-full text-sm font-bold shadow-md shadow-kanji-deep/20 transition-all duration-150 flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={18} aria-hidden="true" />
                  <span className="hidden sm:inline">Registrar</span>
                  <ChevronDown size={16} aria-hidden="true" />
                </button>

                {isCreateMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Registrar movimiento"
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl shadow-black/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40 z-50"
                  >
                    <button
                      role="menuitem"
                      onClick={() => openTransactionModal('INCOME')}
                      className="flex w-full min-h-11 items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      <TrendingUp size={16} aria-hidden="true" className="text-emerald-600 dark:text-emerald-400" />
                      Ingreso
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => openTransactionModal('EXPENSE')}
                      className="flex w-full min-h-11 items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      <TrendingDown size={16} aria-hidden="true" className="text-red-600 dark:text-red-400" />
                      Gasto
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pestañas */}
          <div role="tablist" aria-label="Secciones de finanzas" className="flex items-center gap-6 px-8 mt-4">
            {TABS.map((tab, index) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  id={`finance-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`finance-panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className={`pb-3 pt-1 text-sm font-semibold relative transition-colors duration-150 ${
                    isActive
                      ? 'text-kanji-deep dark:text-kio'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="financeTabIndicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-kanji-deep dark:bg-kio rounded-t-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'resumen' ? (
              <motion.div
                key="resumen"
                {...panelProps('resumen')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto space-y-6"
              >
                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Ingresos"
                    value={data?.totalIncome}
                    loading={isLoading}
                    isError={isError}
                    icon={TrendingUp}
                    color="emerald"
                    delta={incomeDelta}
                    currency={currency}
                  />
                  <StatCard
                    title="Gastos"
                    value={data?.totalExpense}
                    loading={isLoading}
                    isError={isError}
                    icon={TrendingDown}
                    color="red"
                    delta={expenseDelta}
                    deltaInverted
                    currency={currency}
                  />
                  <StatCard
                    title="Utilidad"
                    value={data?.balance}
                    loading={isLoading}
                    isError={isError}
                    icon={Wallet}
                    color="kio"
                    isPrimary
                    delta={balanceDelta}
                    currency={currency}
                  />
                  <StatCard
                    title="Proyección"
                    value={data?.projection}
                    loading={isLoading}
                    isError={isError}
                    icon={CalendarClock}
                    color="blue"
                    hint="Suma de las citas agendadas este mes"
                    currency={currency}
                  />
                </div>

                {/* Gráfica y columna derecha. Cuando el resumen falla, cada
                    superficie lo dice y ofrece reintento; los saldos por cobrar
                    son otra consulta y siguen vivos. */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8 bg-surface dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-kanji-deep dark:text-kio text-base tracking-tight">Flujo de caja</h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">Ingresos y gastos diarios</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" /> Ingresos
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" /> Gastos
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 w-full min-h-[280px]">
                      {/* Una gráfica vacía diría "no hubo movimiento" cuando lo
                          que pasó es que la petición falló. */}
                      {isError ? (
                        <WidgetError what="el flujo de caja del mes" onRetry={() => refetch()} />
                      ) : (
                        <BalanceChart
                          transactions={data?.transactions || []}
                          currency={currency}
                          timeZone={timeZone}
                        />
                      )}
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <OutstandingCard currency={currency} onSeeAll={() => selectTab('por-cobrar')} />
                    <PaymentMethodCard
                      breakdown={data?.paymentMethodBreakdown ?? { CASH: 0, CARD: 0, TRANSFER: 0 }}
                      totalIncome={data?.totalIncome ?? 0}
                      loading={isLoading}
                      isError={isError}
                      onRetry={() => refetch()}
                      currency={currency}
                    />
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'por-cobrar' ? (
              <motion.div
                key="por-cobrar"
                {...panelProps('por-cobrar')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <PorCobrarTab currency={currency} />
              </motion.div>
            ) : activeTab === 'movimientos' ? (
              <motion.div
                key="movimientos"
                {...panelProps('movimientos')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <MovimientosTab month={month} year={year} currency={currency} />
              </motion.div>
            ) : (
              <motion.div
                key="suscripcion"
                {...panelProps('suscripcion')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <SubscriptionTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <TransactionModal
          isOpen={transactionType !== null}
          type={transactionType ?? 'EXPENSE'}
          onClose={() => setTransactionType(null)}
        />
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value?: number;
  loading: boolean;
  /** La cifra no se pudo cargar: se pinta un guion, nunca un cero. */
  isError?: boolean;
  icon: ElementType;
  color: 'emerald' | 'red' | 'kio' | 'blue';
  delta?: number | null;
  deltaInverted?: boolean;
  isPrimary?: boolean;
  hint?: string;
  currency: string;
}

function StatCard({
  title,
  value,
  loading,
  isError,
  icon: Icon,
  color,
  delta,
  deltaInverted,
  isPrimary,
  hint,
  currency,
}: StatCardProps) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
    kio: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-kanji-deep dark:text-kio' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  };
  const colors = colorMap[color];

  // El delta compara con el mes anterior: positivo es bueno salvo en gastos.
  const showDelta = !isError && delta !== null && delta !== undefined;
  const isPositive = showDelta && (deltaInverted ? delta < 0 : delta > 0);
  const isNegative = showDelta && (deltaInverted ? delta > 0 : delta < 0);

  return (
    <div className={`bg-surface dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-150 hover:shadow-md flex flex-col justify-between min-h-32 ${isPrimary ? 'border-kio/30 ring-1 ring-kio/10' : 'border-gray-200 dark:border-slate-800'}`}>
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl ${colors.bg} ${colors.text}`}>
          <Icon size={18} aria-hidden="true" />
        </div>
        {showDelta && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : isNegative
              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
          }`}>
            {delta > 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
          {title}
        </p>
        {isError ? (
          // Un cero es un dato; aquí no hay dato. Ver DESIGN.md → nunca afirmar
          // un hecho que la interfaz no puede sostener.
          <h2
            className="text-2xl font-bold text-gray-400 dark:text-slate-500 tracking-tight"
            aria-label={`${title}: no disponible`}
          >
            —
          </h2>
        ) : loading ? (
          <Skeleton className="w-24 h-8" />
        ) : (
          <h2 className="text-2xl font-bold text-kanji-deep dark:text-kio tracking-tight tabular-nums">
            {formatMoney(Number(value || 0), currency)}
          </h2>
        )}
        {hint && (
          <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  );
}
