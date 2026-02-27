import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Download, Loader2, Wallet } from 'lucide-react';
import { useFinanceTransactions } from '../api/useFinanceSummary';
import type { FinanceTransaction } from '../types';

interface MovimientosTabProps {
  month: number;
  year: number;
  currency: string;
}

function exportCSV(transactions: FinanceTransaction[], month: number, year: number, currency: string) {
  const header = ['Fecha', 'Descripción', 'Categoría', 'Tipo', `Monto (${currency})`].join(',');
  const rows = transactions.map((t) => {
    const fecha = format(parseISO(t.date), 'dd/MM/yyyy');
    const desc = t.description || t.appointment?.patient.fullName || t.category;
    const tipo = t.type === 'INCOME' ? 'Ingreso' : 'Gasto';
    const monto = (t.type === 'INCOME' ? '' : '-') + Number(t.amount).toFixed(2);
    return [fecha, `"${desc}"`, `"${t.category}"`, tipo, monto].join(',');
  });

  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv, ''], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finanzas-${year}-${String(month).padStart(2, '0')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const FILTER_OPTIONS = [
  { key: undefined, label: 'Todos' },
  { key: 'INCOME' as const, label: 'Ingresos' },
  { key: 'EXPENSE' as const, label: 'Gastos' },
];

export function MovimientosTab({ month, year, currency }: MovimientosTabProps) {
  const [typeFilter, setTypeFilter] = useState<'INCOME' | 'EXPENSE' | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useFinanceTransactions(month, year, typeFilter, page);

  const transactions = data?.data ?? [];
  const meta = data?.meta;

  const handleFilterChange = (key: 'INCOME' | 'EXPENSE' | undefined) => {
    setTypeFilter(key);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={String(key)}
              onClick={() => handleFilterChange(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === key
                  ? 'bg-white dark:bg-slate-700 text-kanji dark:text-kio shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => transactions.length > 0 && exportCSV(transactions, month, year, currency)}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[1fr_2fr_1fr_auto_auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Fecha</span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Descripción</span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Categoría</span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Tipo</span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-right">Monto</span>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-300 dark:text-slate-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
            <Wallet size={28} className="text-gray-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-slate-400">Sin movimientos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {transactions.map((t) => {
              const isIncome = t.type === 'INCOME';
              const desc = t.description || t.appointment?.patient.fullName || '—';
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-[1fr_2fr_1fr_auto_auto] gap-4 px-6 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-xs text-gray-500 dark:text-slate-400 tabular-nums">
                    {format(parseISO(t.date), 'd MMM yyyy', { locale: es })}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                    {desc}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {t.category}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isIncome
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  }`}>
                    {isIncome ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {isIncome ? 'Ingreso' : 'Gasto'}
                  </span>
                  <span className={`text-sm font-bold tabular-nums text-right ${
                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isIncome ? '+' : '-'}{currency}${Number(t.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {meta.total} movimientos · Página {meta.page} de {meta.lastPage}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: meta.lastPage }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === meta.lastPage || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span key={`ellipsis-${p}`} className="text-xs text-gray-400 px-1">…</span>
                  )}
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      p === page
                        ? 'bg-kanji dark:bg-kio text-white dark:text-slate-900'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                </>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
              disabled={page === meta.lastPage}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
