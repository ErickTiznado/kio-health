import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  MoreVertical,
  Pencil,
  RotateCcw,
  Trash2,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { WidgetError } from '../../../components/widgets/WidgetError';
import { confirmAction } from '../../../lib/confirm-action';
import { getErrorMessage } from '../../../lib/errors';
import {
  fetchAllFinanceTransactions,
  useDeleteTransaction,
  useFinanceTransactions,
  useUpdateAppointmentPayment,
} from '../api/useFinanceSummary';
import { formatFinanceDay, formatFinanceDayNumeric, useFinanceTimeZone } from '../dates';
import { categoryLabel, paymentMethodLabel } from '../labels';
import { formatMoney } from '../money';
import { EditTransactionModal } from './EditTransactionModal';
import type { FinanceTransaction } from '../types';

interface MovimientosTabProps {
  month: number;
  year: number;
  currency: string;
}

/**
 * Seis columnas no caben en un móvil: a 375px el ancho útil ronda los 311px y
 * `px-6` más cinco `gap-4` ya se comen 128px. La tabla lleva un ancho mínimo y
 * scroll horizontal —igual que la de "Por cobrar"— en vez de recortar la última
 * columna, que es justo donde vive el menú de acciones.
 */
const ROW_GRID = 'grid min-w-[640px] grid-cols-[1fr_2fr_1fr_auto_auto_44px] gap-4 px-6 items-center';

/**
 * Excel evalúa como fórmula cualquier celda que empiece por `=`, `+`, `-` o
 * `@`, incluso entrecomillada. El texto de usuario se neutraliza antes de
 * escribirlo en un archivo que va a abrir un contador.
 */
function csvText(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * `timeZone` es la zona en la que se lee el día civil de cada movimiento, y este
 * archivo acaba en manos de un contador: formatear con la zona equivocada saca
 * un movimiento del 1 de agosto como «31/07».
 *
 * Cuidado con el tiempo verbal: hoy `useFinanceTimeZone()` todavía cae en la
 * zona del NAVEGADOR, porque `GET /auth/me` no manda `profile.timezone`. Pasará
 * a ser la del clínico —sin tocar este archivo— en cuanto el perfil traiga el
 * campo. La deuda está detallada en el docblock de `dates.ts`.
 */
function buildCsv(
  transactions: FinanceTransaction[],
  currency: string,
  timeZone: string,
): string {
  const header = ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Método', `Monto (${currency})`].join(',');
  const rows = transactions.map((t) => {
    const fecha = formatFinanceDayNumeric(t.date, timeZone);
    const desc = t.description || t.appointment?.patient.fullName || categoryLabel(t.category);
    const tipo = t.type === 'INCOME' ? 'Ingreso' : 'Gasto';
    const metodo = t.appointment?.paymentMethod ? paymentMethodLabel(t.appointment.paymentMethod) : '';
    const monto = (t.type === 'INCOME' ? '' : '-') + Number(t.amount).toFixed(2);
    return [fecha, csvText(desc), csvText(categoryLabel(t.category)), tipo, csvText(metodo), monto].join(',');
  });

  return [header, ...rows].join('\n');
}

function downloadCsv(csv: string, filename: string) {
  // El BOM es lo que hace que Excel abra los acentos bien.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const FILTER_OPTIONS = [
  { key: undefined, label: 'Todos' },
  { key: 'INCOME' as const, label: 'Ingresos' },
  { key: 'EXPENSE' as const, label: 'Gastos' },
];

const MENU_WIDTH = 248;
const MENU_HEIGHT = 120;

/**
 * Acciones de una fila.
 *
 * Dos ciclos de vida distintos, y por eso dos menús distintos:
 * - Movimiento nacido de una CITA: se corrige y se revierte a través de la cita
 *   (`PATCH /appointments/:id/payment`). `PATCH`/`DELETE /finance/:id` lo
 *   rechazan con 400 a propósito, para que el importe no tenga dos fuentes de
 *   verdad.
 * - Movimiento tecleado A MANO: se edita y se borra directamente
 *   (`PATCH` y `DELETE /finance/:id`).
 *
 * Aquí vivían dos botones `aria-disabled` con una nota que decía que los
 * movimientos manuales «todavía no se pueden editar ni eliminar». Las rutas
 * existen, así que la nota era falsa y se retiró junto con los botones muertos.
 */
function RowActions({
  transaction,
  label,
  onEdit,
  onRevert,
  onDelete,
}: {
  transaction: FinanceTransaction;
  label: string;
  onEdit: (t: FinanceTransaction) => void;
  onRevert: (t: FinanceTransaction) => void;
  onDelete: (t: FinanceTransaction) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isFromAppointment = Boolean(transaction.appointmentId);

  // Igual que el menú de pacientes: el panel vive en un portal (la tabla tiene
  // overflow) y se abre hacia arriba cuando no cabe por debajo.
  const toggle = useCallback(() => {
    setIsOpen((open) => {
      if (open) return false;
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const fitsBelow = rect.bottom + 8 + MENU_HEIGHT <= window.innerHeight - 8;
        setCoords({
          top: fitsBelow ? rect.bottom + 8 : Math.max(8, rect.top - 8 - MENU_HEIGHT),
          left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
        });
      }
      return true;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const item =
    'w-full text-left px-4 py-2.5 min-h-11 text-sm font-medium flex items-center gap-3 transition-colors duration-150';

  const run = (fn: (t: FinanceTransaction) => void) => () => {
    setIsOpen(false);
    fn(transaction);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Acciones de ${label}`}
        onClick={toggle}
        className="grid h-11 w-11 place-items-center rounded-full text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-kanji-deep dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-kio"
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
            className="fixed z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl shadow-black/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
          >
            <div role="menu" aria-label={`Acciones de ${label}`}>
              {isFromAppointment ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={run(onEdit)}
                    className={`${item} text-gray-800 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800`}
                  >
                    <Pencil size={16} aria-hidden="true" className="text-gray-500 dark:text-slate-400" />
                    Corregir cobro
                  </button>
                  <div className="mx-4 my-1 h-px bg-gray-100 dark:bg-slate-800" role="separator" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={run(onRevert)}
                    className={`${item} text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20`}
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                    Marcar como pendiente
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={run(onEdit)}
                    className={`${item} text-gray-800 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800`}
                  >
                    <Pencil size={16} aria-hidden="true" className="text-gray-500 dark:text-slate-400" />
                    Editar movimiento
                  </button>
                  <div className="mx-4 my-1 h-px bg-gray-100 dark:bg-slate-800" role="separator" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={run(onDelete)}
                    className={`${item} text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function MovimientosTab({ month, year, currency }: MovimientosTabProps) {
  const [typeFilter, setTypeFilter] = useState<'INCOME' | 'EXPENSE' | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [editing, setEditing] = useState<FinanceTransaction | null>(null);

  const timeZone = useFinanceTimeZone();
  const { data, isLoading, isError, refetch } = useFinanceTransactions(month, year, typeFilter, page);
  const paymentMutation = useUpdateAppointmentPayment();
  const deleteMutation = useDeleteTransaction();

  const transactions = data?.data ?? [];
  const meta = data?.meta;

  // Si la página actual deja de existir —revertir el último cobro de la última
  // página—, volver a la última que sí existe en vez de quedarse en un vacío.
  if (meta && meta.lastPage >= 1 && page > meta.lastPage) {
    setPage(meta.lastPage);
  }

  const handleFilterChange = (key: 'INCOME' | 'EXPENSE' | undefined) => {
    setTypeFilter(key);
    setPage(1);
  };

  /**
   * Exporta el MES COMPLETO, no la página abierta. El archivo se llama
   * `finanzas-YYYY-MM.csv` y termina en manos de un contador: recortarlo en
   * silencio a 15 filas era el peor defecto del módulo.
   */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { transactions: all, omitted } = await fetchAllFinanceTransactions(
        month,
        year,
        typeFilter,
      );
      if (all.length === 0) {
        toast.error('No hay movimientos que exportar en este mes');
        return;
      }
      const suffix = typeFilter === 'INCOME' ? '-ingresos' : typeFilter === 'EXPENSE' ? '-gastos' : '';
      downloadCsv(
        buildCsv(all, currency, timeZone),
        `finanzas-${year}-${String(month).padStart(2, '0')}${suffix}.csv`,
      );
      // Un archivo recortado no se anuncia como completo: quien se lo pasa al
      // contador tiene que saber que le faltan filas.
      if (omitted > 0) {
        toast.warning(
          `El archivo incluye ${all.length} movimientos y ${omitted} quedaron fuera: el mes supera el máximo que podemos exportar de una vez.` +
            (typeFilter ? '' : ' Filtra por ingresos o por gastos y exporta cada parte.'),
        );
      } else {
        toast.success(
          all.length === 1 ? '1 movimiento exportado' : `${all.length} movimientos exportados`,
        );
      }
    } catch (error) {
      console.error('Failed to export finance CSV', error);
      toast.error('No pudimos exportar los movimientos del mes');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRevert = async (transaction: FinanceTransaction) => {
    if (!transaction.appointmentId) return;
    const confirmed = await confirmAction({
      title: '¿Marcar el cobro como pendiente?',
      description:
        'La sesión vuelve a contar como saldo por cobrar y este ingreso desaparece del mes. Podrás volver a registrarlo desde Por cobrar.',
      confirmLabel: 'Marcar pendiente',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await paymentMutation.mutateAsync({
        appointmentId: transaction.appointmentId,
        payload: { status: 'PENDING' },
      });
      toast.success('El cobro volvió a pendiente');
    } catch {
      toast.error('No pudimos actualizar el cobro. Vuelve a intentarlo.');
    }
  };

  /**
   * Borrar un movimiento MANUAL (`DELETE /finance/:id`).
   *
   * El 400 de este endpoint no es un error de formato: es el servidor diciendo
   * que el movimiento cuelga de una cita. Se muestra su mensaje en vez de un
   * texto genérico que mandaría al clínico a buscar el fallo donde no está.
   */
  const handleDelete = async (transaction: FinanceTransaction) => {
    const confirmed = await confirmAction({
      title: '¿Eliminar este movimiento?',
      description:
        'Deja de contar en los totales del mes y en el CSV. No se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(transaction.id);
      toast.success('Movimiento eliminado');
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'No pudimos eliminar el movimiento. Vuelve a intentarlo.'),
      );
    }
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
              aria-pressed={typeFilter === key}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                typeFilter === key
                  ? 'bg-white dark:bg-slate-700 text-kanji-deep dark:text-kio shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || isError || !meta || meta.total === 0}
          className="flex items-center gap-2 px-4 py-2 min-h-11 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <Download size={15} aria-hidden="true" />
          )}
          Exportar el mes en CSV
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-surface dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Scroll horizontal: en móvil las seis columnas no caben. */}
        <div className="overflow-x-auto">
          {/* Encabezado */}
          <div className={`${ROW_GRID} py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800`}>
            {/* 11px es el suelo tipográfico del sistema y el tamaño de la
                versalita de etiqueta. Estas cabeceras estaban a 10px. */}
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Fecha</span>
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Descripción</span>
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Categoría</span>
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Tipo</span>
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Monto</span>
            <span className="sr-only">Acciones</span>
          </div>

          {/* Cuerpo. El error se comprueba ANTES del vacío: "Sin movimientos"
              ante un 500 es una afirmación falsa sobre el dinero del mes. */}
          {isError ? (
            <div className="p-6">
              <WidgetError what="los movimientos de este mes" onRetry={() => refetch()} />
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-300 dark:text-slate-600" aria-hidden="true" />
              <span className="sr-only">Cargando movimientos</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Wallet size={28} className="text-gray-300 dark:text-slate-600 mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Sin movimientos</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-slate-800">
              {transactions.map((t) => {
                const isIncome = t.type === 'INCOME';
                const desc = t.description || t.appointment?.patient.fullName || '—';
                return (
                  <div
                    key={t.id}
                    className={`${ROW_GRID} py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150`}
                  >
                    <span className="text-xs text-gray-500 dark:text-slate-400 tabular-nums">
                      {formatFinanceDay(t.date, timeZone)}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                      {desc}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {categoryLabel(t.category)}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isIncome
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    }`}>
                      {isIncome ? <ArrowUpRight size={12} aria-hidden="true" /> : <ArrowDownRight size={12} aria-hidden="true" />}
                      {isIncome ? 'Ingreso' : 'Gasto'}
                    </span>
                    <span className={`text-sm font-bold tabular-nums text-right ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isIncome ? '+' : '-'}{formatMoney(Number(t.amount), currency)}
                    </span>
                    <RowActions
                      transaction={t}
                      label={desc}
                      onEdit={setEditing}
                      onRevert={handleRevert}
                      onDelete={handleDelete}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Paginación */}
      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {meta.total} movimientos · Página {meta.page} de {meta.lastPage}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Página anterior"
              className="grid h-11 w-11 place-items-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            {Array.from({ length: meta.lastPage }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === meta.lastPage || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                // La `key` va en el Fragment, no en los hijos: estaba en el
                // botón y React avisaba de key duplicada en cada render.
                <Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-xs text-gray-500 dark:text-slate-400 px-1" aria-hidden="true">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    aria-label={`Página ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                    className={`h-11 min-w-11 px-2 rounded-xl text-xs font-bold transition-colors duration-150 ${
                      p === page
                        ? 'bg-kanji-deep dark:bg-kio text-white dark:text-slate-900'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                </Fragment>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
              disabled={page === meta.lastPage}
              aria-label="Página siguiente"
              className="grid h-11 w-11 place-items-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <EditTransactionModal
        transaction={editing}
        currency={currency}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
