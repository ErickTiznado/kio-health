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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pt-4 pb-3 border-b border-[var(--color-cruz)] bg-white/50 backdrop-blur-sm sticky z-30">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-kanji)] tracking-tight">Finanzas</h1>
            <p className="text-sm text-[var(--color-text)] opacity-60 mt-0.5 capitalize">
                {format(selectedDate, 'MMMM yyyy', { locale: es })}
            </p>
          </div>

          <div className="flex items-center gap-3">
             {/* Month Navigation */}
             <div className="flex items-center gap-1 bg-white rounded-[24px] border border-[var(--color-cruz)] shadow-sm p-1">
                 <button onClick={handlePrevMonth} className="p-2 rounded-xl hover:bg-[var(--color-kio-light)] text-[var(--color-kanji)] transition-all">
                     <ChevronLeft size={16} />
                 </button>
                 <span className="px-4 text-xs font-bold text-[var(--color-kanji)] capitalize select-none min-w-[100px] text-center">
                     {format(selectedDate, 'MMMM', { locale: es })}
                 </span>
                 <button onClick={handleNextMonth} className="p-2 rounded-xl hover:bg-[var(--color-kio-light)] text-[var(--color-kanji)] transition-all">
                     <ChevronRight size={16} />
                 </button>
             </div>

             {/* Action Button */}
             <button 
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-kio hover:bg-[var(--color-kanji)] text-white px-5 py-2.5 rounded-[24px] text-sm font-bold shadow-lg shadow-kio/20 transition-all active:scale-95 flex items-center gap-2"
             >
                <Plus size={18} />
                <span className="hidden sm:inline">Nuevo Gasto</span>
             </button>
          </div>
        </div>

        {/* CONTENT: Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Ingresos" 
                    value={data?.totalIncome} 
                    loading={isLoading} 
                    icon={TrendingUp} 
                    accentColor="text-emerald-500"
                    trend="+12%" // Mock
                  />
                  <StatCard 
                    title="Gastos" 
                    value={data?.totalExpense} 
                    loading={isLoading} 
                    icon={TrendingDown} 
                    accentColor="text-red-500"
                  />
                  <StatCard 
                    title="Utilidad" 
                    value={data?.balance} 
                    loading={isLoading} 
                    icon={Wallet} 
                    accentColor="text-[var(--color-kio)]"
                    isPrimary
                  />
                   <StatCard 
                    title="Por Cobrar" 
                    value={totalDebt} 
                    loading={isLoading} 
                    icon={AlertCircle} 
                    accentColor="text-amber-500"
                    tooltip="Pagos pendientes"
                  />
                </div>

                <div className="grid grid-cols-12 gap-6">
                  {/* CHART */}
                  <div className="col-span-12 lg:col-span-8 bg-white rounded-[24px] p-6 shadow-sm border border-[var(--color-cruz)] flex flex-col">
                     <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-[var(--color-kanji)] text-lg tracking-tight">Flujo de Caja</h3>
                            <p className="text-xs text-[var(--color-text)] opacity-60 mt-1">Ingresos vs Gastos diarios</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] opacity-60">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ingresos
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] opacity-60">
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
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[var(--color-cruz)] relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-[var(--color-kio-light)] text-[var(--color-kio)]">
                                <DollarSign size={16} />
                            </div>
                            <p className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase tracking-widest">Proyección</p>
                        </div>
                        <h3 className="text-3xl font-black text-[var(--color-kanji)] mb-1 tracking-tight">
                             ${Number((data?.totalIncome || 0) + pendingIncome).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-[var(--color-text)] opacity-60 mt-2">
                            Estimado mensual (Citas agendadas)
                        </p>
                    </div>

                    {/* Transactions */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[var(--color-cruz)] flex-1 min-h-[300px] flex flex-col">
                      <h3 className="font-bold text-[var(--color-kanji)] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                        Movimientos
                      </h3>
                      <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        {isLoading ? (
                           <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[var(--color-cruz)]" /></div>
                        ) : data?.transactions.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-40">
                             <Wallet size={24} className="text-[var(--color-cruz)] mb-2" />
                             <p className="text-xs text-[var(--color-text)]">Sin movimientos</p>
                          </div>
                        ) : (
                          data?.transactions.slice(0, 8).map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-kio-light)]/20 transition-colors group">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${t.type === 'INCOME' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-red-100 bg-red-50 text-red-600'}`}>
                                  {t.type === 'INCOME' ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-[var(--color-kanji)] truncate max-w-[120px]">
                                    {t.description || t.category}
                                  </span>
                                  <span className="text-[10px] text-[var(--color-text)] opacity-60">
                                    {format(parseISO(t.date), 'd MMM', { locale: es })}
                                  </span>
                                </div>
                              </div>
                              <span className={`text-xs font-bold tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
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
      </div>

      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
      />
    </DashboardLayout>
  );
}

interface StatCardProps {
    title: string;
    value?: number;
    loading: boolean;
    icon: ElementType;
    accentColor: string;
    trend?: string;
    isPrimary?: boolean;
    tooltip?: string;
}

function StatCard({ title, value, loading, icon: Icon, accentColor, trend, isPrimary, tooltip }: StatCardProps) {
    return (
        <div className={`bg-white rounded-[24px] p-5 border transition-all hover:shadow-md flex flex-col justify-between h-32 ${isPrimary ? 'border-[var(--color-kio)]/30 ring-1 ring-[var(--color-kio)]/10' : 'border-[var(--color-cruz)]'}`}>
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl bg-gray-50 ${accentColor}`}>
                    <Icon size={18} />
                </div>
                 {trend && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-[10px] font-bold text-[var(--color-text)] opacity-60 uppercase tracking-widest">{title}</p>
                    {tooltip && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-cruz)]" title={tooltip} />}
                </div>
                {loading ? (
                    <Skeleton className="w-24 h-8" />
                ) : (
                    <h2 className="text-2xl font-black text-[var(--color-kanji)] tracking-tight">
                        ${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </h2>
                )}
            </div>
        </div>
    )
}
