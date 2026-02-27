import { useState, type ElementType } from 'react';
import { useFinanceSummary } from '../../features/finance/api/useFinanceSummary';
import { BalanceChart } from '../../features/finance/components/BalanceChart';
import { ExpenseModal } from '../../features/finance/components/ExpenseModal';
import { PaymentMethodCard } from '../../features/finance/components/PaymentMethodCard';
import { MovimientosTab } from '../../features/finance/components/MovimientosTab';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuthStore } from '../../stores/auth.store';
import { format, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, TrendingUp, TrendingDown, Wallet, CalendarClock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Skeleton } from '@repo/ui/skeleton';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'resumen' | 'movimientos';

function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default function FinancePage() {
  useDocumentTitle('Finanzas');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>('resumen');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const currency = useAuthStore((s) => s.user?.profile?.currency ?? 'USD');

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const { data, isLoading } = useFinanceSummary(month, year);

  const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

  const incomeDelta = data ? calcDelta(data.totalIncome, data.previousMonth.totalIncome) : null;
  const expenseDelta = data ? calcDelta(data.totalExpense, data.previousMonth.totalExpense) : null;
  const balanceDelta = data ? calcDelta(data.balance, data.previousMonth.balance) : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-30 bg-surface/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-8 pt-6 pb-0">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-kanji dark:text-kio tracking-tight">Finanzas</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 opacity-60 font-medium capitalize">
                {format(selectedDate, 'MMMM yyyy', { locale: es })}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Month Navigation */}
              <div className="flex items-center gap-1 bg-surface dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm p-1">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-kanji dark:text-kio transition-all">
                  <ChevronLeft size={16} />
                </button>
                <span className="px-4 text-xs font-bold text-kanji dark:text-kio capitalize select-none min-w-[100px] text-center">
                  {format(selectedDate, 'MMMM', { locale: es })}
                </span>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-kanji dark:text-kio transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>

              {isLoading && <Loader2 size={16} className="animate-spin text-kanji dark:text-kio opacity-50" />}

              {/* New Expense */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-kio hover:bg-kanji text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-kio/20 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nuevo Gasto</span>
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 px-8 mt-4">
            {(['resumen', 'movimientos'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold capitalize relative transition-all ${
                  activeTab === tab
                    ? 'text-kanji dark:text-kio'
                    : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="financeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-kanji dark:bg-kio rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'resumen' ? (
              <motion.div
                key="resumen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto space-y-6"
              >
                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Ingresos"
                    value={data?.totalIncome}
                    loading={isLoading}
                    icon={TrendingUp}
                    color="emerald"
                    delta={incomeDelta}
                    currency={currency}
                  />
                  <StatCard
                    title="Gastos"
                    value={data?.totalExpense}
                    loading={isLoading}
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
                    icon={CalendarClock}
                    color="blue"
                    tooltip="Suma de citas agendadas este mes"
                    currency={currency}
                  />
                </div>

                {/* CHARTS ROW */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Cash Flow Chart */}
                  <div className="col-span-12 lg:col-span-8 bg-surface dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-kanji dark:text-kio text-base tracking-tight">Flujo de Caja</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 opacity-60 mt-0.5">Ingresos vs Gastos diarios</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Ingresos
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> Gastos
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 w-full min-h-[280px]">
                      <BalanceChart transactions={data?.transactions || []} />
                    </div>
                  </div>

                  {/* Payment Method Card */}
                  <div className="col-span-12 lg:col-span-4">
                    <PaymentMethodCard
                      breakdown={data?.paymentMethodBreakdown ?? { CASH: 0, CARD: 0, TRANSFER: 0 }}
                      totalIncome={data?.totalIncome ?? 0}
                      loading={isLoading}
                      currency={currency}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="movimientos"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <MovimientosTab month={month} year={year} currency={currency} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value?: number;
  loading: boolean;
  icon: ElementType;
  color: 'emerald' | 'red' | 'kio' | 'blue';
  delta?: number | null;
  deltaInverted?: boolean;
  isPrimary?: boolean;
  tooltip?: string;
  currency: string;
}

function StatCard({ title, value, loading, icon: Icon, color, delta, deltaInverted, isPrimary, tooltip, currency }: StatCardProps) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
    kio: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-kanji dark:text-kio' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  };
  const colors = colorMap[color];

  // Delta display: positive is good for income/balance, bad for expenses (deltaInverted)
  const isPositive = delta !== null && delta !== undefined && (deltaInverted ? delta < 0 : delta > 0);
  const isNegative = delta !== null && delta !== undefined && (deltaInverted ? delta > 0 : delta < 0);

  return (
    <div className={`bg-surface dark:bg-slate-900 rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between h-32 ${isPrimary ? 'border-kio/30 ring-1 ring-kio/10' : 'border-gray-200 dark:border-slate-800'}`}>
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl ${colors.bg} ${colors.text}`}>
          <Icon size={18} />
        </div>
        {delta !== null && delta !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : isNegative
              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
          }`}>
            {delta > 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div>
        <div className="flex items-center gap-1 mb-0.5">
          <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 opacity-60 uppercase tracking-widest">{title}</p>
          {tooltip && (
            <span title={tooltip} className="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-[8px] font-black flex items-center justify-center cursor-default">?</span>
          )}
        </div>
        {loading ? (
          <Skeleton className="w-24 h-8" />
        ) : (
          <h2 className="text-2xl font-black text-kanji dark:text-kio tracking-tight">
            {currency}${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </h2>
        )}
      </div>
    </div>
  );
}
