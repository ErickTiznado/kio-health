import { useState, type ElementType } from 'react';
import { useFinanceSummary } from '../../features/finance/api/useFinanceSummary';
import { BalanceChart } from '../../features/finance/components/BalanceChart';
import { ExpenseModal } from '../../features/finance/components/ExpenseModal';
import { DashboardLayout } from '../../components/DashboardLayout';
import { format, subMonths, addMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { motion } from 'framer-motion';

export default function FinancePage() {
  useDocumentTitle('Finanzas');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const { data, isLoading } = useFinanceSummary(month, year);

  const pendingIncome = 0; // TODO: Fetch from backend
  const totalDebt = 0; // TODO: Fetch from backend

  const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6">
        
        {/* HEADER: Sticky & Blurry matching AgendaPage & PatientsPage */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-8 pt-6 pb-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-kanji dark:text-kio tracking-tight">Finanzas</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 opacity-60 font-medium capitalize">
                  {format(selectedDate, 'MMMM yyyy', { locale: es })}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
               {/* Month Navigation */}
               <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm p-1">
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

               {/* Action Button */}
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
        </motion.div>

        {/* CONTENT: Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Ingresos" 
                    value={data?.totalIncome} 
                    loading={isLoading} 
                    icon={TrendingUp} 
                    color="emerald"
                    trend="+12%" // Mock
                  />
                  <StatCard 
                    title="Gastos" 
                    value={data?.totalExpense} 
                    loading={isLoading} 
                    icon={TrendingDown} 
                    color="red"
                  />
                  <StatCard 
                    title="Utilidad" 
                    value={data?.balance} 
                    loading={isLoading} 
                    icon={Wallet} 
                    color="kio"
                    isPrimary
                  />
                   <StatCard 
                    title="Por Cobrar" 
                    value={totalDebt} 
                    loading={isLoading} 
                    icon={AlertCircle} 
                    color="amber"
                    tooltip="Pagos pendientes"
                  />
                </div>

                <div className="grid grid-cols-12 gap-6">
                  {/* CHART */}
                  <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col">
                     <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-kanji dark:text-kio text-lg tracking-tight">Flujo de Caja</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 opacity-60 mt-1">Ingresos vs Gastos diarios</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 opacity-60">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ingresos
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 opacity-60">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Gastos
                            </div>
                        </div>
                     </div>
                     <div className="flex-1 w-full min-h-[300px]">
                        <BalanceChart transactions={data?.transactions || []} />
                     </div>
                  </div>

                  {/* SIDEBAR */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    {/* Projection */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-kio/10 dark:bg-kio/20 text-kanji dark:text-kio">
                                <DollarSign size={16} />
                            </div>
                            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 opacity-60 uppercase tracking-widest">Proyección</p>
                        </div>
                        <h3 className="text-3xl font-black text-kanji dark:text-kio mb-1 tracking-tight">
                             ${Number((data?.totalIncome || 0) + pendingIncome).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 opacity-60 mt-2">
                            Estimado mensual (Citas agendadas)
                        </p>
                    </div>

                    {/* Transactions */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex-1 min-h-[300px] flex flex-col">
                      <h3 className="font-bold text-kanji dark:text-kio mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                        Movimientos
                      </h3>
                      <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        {isLoading ? (
                           <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-300 dark:text-slate-600" /></div>
                        ) : data?.transactions.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-40">
                             <Wallet size={24} className="text-gray-300 dark:text-slate-600 mb-2" />
                             <p className="text-xs text-gray-500 dark:text-slate-400">Sin movimientos</p>
                          </div>
                        ) : (
                          data?.transactions.slice(0, 8).map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${t.type === 'INCOME' ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                  {t.type === 'INCOME' ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-gray-700 dark:text-slate-200 truncate max-w-[120px]">
                                    {t.description || t.category}
                                  </span>
                                  <span className="text-[10px] text-gray-500 dark:text-slate-400 opacity-60">
                                    {format(parseISO(t.date), 'd MMM', { locale: es })}
                                  </span>
                                </div>
                              </div>
                              <span className={`text-xs font-bold tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            </div>
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
    color: 'emerald' | 'red' | 'amber' | 'kio';
    trend?: string;
    isPrimary?: boolean;
    tooltip?: string;
}

function StatCard({ title, value, loading, icon: Icon, color, trend, isPrimary, tooltip }: StatCardProps) {
    // Dynamic color mapping
    const colorMap = {
        emerald: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            text: 'text-emerald-600 dark:text-emerald-400',
            badgeBg: 'bg-emerald-50 dark:bg-emerald-900/30',
            badgeBorder: 'border-emerald-100 dark:border-emerald-900/40',
            badgeText: 'text-emerald-700 dark:text-emerald-300'
        },
        red: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            text: 'text-red-600 dark:text-red-400',
            badgeBg: 'bg-red-50 dark:bg-red-900/30',
            badgeBorder: 'border-red-100 dark:border-red-900/40',
            badgeText: 'text-red-700 dark:text-red-300'
        },
        amber: {
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            text: 'text-amber-600 dark:text-amber-400',
            badgeBg: 'bg-amber-50 dark:bg-amber-900/30',
            badgeBorder: 'border-amber-100 dark:border-amber-900/40',
            badgeText: 'text-amber-700 dark:text-amber-300'
        },
        kio: { // Using purple/violet/kio colors
            bg: 'bg-violet-50 dark:bg-violet-900/20',
            text: 'text-kanji dark:text-kio', // Custom brand colors
            badgeBg: 'bg-violet-50 dark:bg-violet-900/30',
            badgeBorder: 'border-violet-100 dark:border-violet-900/40',
            badgeText: 'text-violet-700 dark:text-violet-300'
        }
    };

    const colors = colorMap[color];

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between h-32 ${isPrimary ? 'border-kio/30 ring-1 ring-kio/10' : 'border-gray-200 dark:border-slate-800'}`}>
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl ${colors.bg} ${colors.text}`}>
                    <Icon size={18} />
                </div>
                 {trend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badgeBg} ${colors.badgeBorder} ${colors.badgeText}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 opacity-60 uppercase tracking-widest">{title}</p>
                    {tooltip && <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600" title={tooltip} />}
                </div>
                {loading ? (
                    <Skeleton className="w-24 h-8" />
                ) : (
                    <h2 className="text-2xl font-black text-kanji dark:text-kio tracking-tight">
                        ${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </h2>
                )}
            </div>
        </div>
    )
}
