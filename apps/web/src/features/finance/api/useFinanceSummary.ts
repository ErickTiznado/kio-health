import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, subDays, subMonths } from 'date-fns';
import { api } from '../../../lib/api';
import {
  fetchAppointmentsByRange,
  getTodayDateString,
  updatePayment,
  type UpdatePaymentPayload,
} from '../../../lib/appointments.api';
import { appointmentKeys } from '../../../lib/query-keys';
import type { Appointment } from '../../../types/appointments.types';
import type {
  FinanceSummary,
  FinanceTransaction,
  FinanceTransactionsResponse,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  OutstandingResponse,
} from '../types';

/**
 * Claves de caché del módulo. `lib/query-keys.ts` todavía no tiene fábrica de
 * finanzas (y no es de este carril), así que vive aquí manteniendo el prefijo
 * `['finance']` que ya usaba el módulo: la invalidación amplia sigue valiendo.
 */
export const financeKeys = {
  all: ['finance'] as const,
  summary: (month: number, year: number) =>
    [...financeKeys.all, 'summary', month, year] as const,
  transactions: (
    month: number,
    year: number,
    type: 'INCOME' | 'EXPENSE' | undefined,
    page: number,
  ) => [...financeKeys.all, 'transactions', month, year, type ?? 'ALL', page] as const,
  outstanding: () => [...financeKeys.all, 'outstanding'] as const,
  pendingSessions: (patientId: string) =>
    [...financeKeys.all, 'pending-sessions', patientId] as const,
};

export const fetchFinanceSummary = async (month: number, year: number): Promise<FinanceSummary> => {
  const { data } = await api.get('/finance/summary', { params: { month, year } });
  return data;
};

export const fetchFinanceTransactions = async (
  month: number,
  year: number,
  type?: 'INCOME' | 'EXPENSE',
  page = 1,
  limit = 15,
): Promise<FinanceTransactionsResponse> => {
  const { data } = await api.get('/finance/transactions', {
    params: { month, year, type, page, limit },
  });
  return data;
};

/** Tamaño de página al recorrer el mes completo para exportar. */
const EXPORT_PAGE_SIZE = 200;
/** Tope de seguridad: 20 000 movimientos en un mes ya es un error de datos. */
const EXPORT_MAX_PAGES = 100;

export interface AllFinanceTransactionsResult {
  transactions: FinanceTransaction[];
  /**
   * Movimientos del mes que el tope de páginas dejó fuera. Cero cuando el mes
   * entró completo. Quien exporta TIENE que enterarse: un CSV recortado en
   * silencio es exactamente el defecto que este recorrido vino a arreglar.
   */
  omitted: number;
}

/**
 * TODOS los movimientos del mes, no solo la página visible.
 *
 * El CSV se llama `finanzas-YYYY-MM.csv` y se le manda al contador: exportar
 * las 15 filas de la página abierta era un recorte silencioso. Recorre la
 * paginación del servidor hasta agotar el mes, y si topa con
 * `EXPORT_MAX_PAGES` lo declara en `omitted` en vez de callárselo.
 */
export const fetchAllFinanceTransactions = async (
  month: number,
  year: number,
  type?: 'INCOME' | 'EXPENSE',
): Promise<AllFinanceTransactionsResult> => {
  const first = await fetchFinanceTransactions(month, year, type, 1, EXPORT_PAGE_SIZE);
  const reportedLastPage = first.meta?.lastPage ?? 1;
  const lastPage = Math.min(reportedLastPage, EXPORT_MAX_PAGES);

  const all = [...first.data];
  for (let page = 2; page <= lastPage; page++) {
    const next = await fetchFinanceTransactions(month, year, type, page, EXPORT_PAGE_SIZE);
    all.push(...next.data);
  }

  const reportedTotal = first.meta?.total ?? all.length;
  const omitted =
    reportedLastPage > lastPage ? Math.max(0, reportedTotal - all.length) : 0;

  return { transactions: all, omitted };
};

export const createTransaction = async (payload: CreateTransactionPayload) => {
  const { data } = await api.post('/finance', payload);
  return data;
};

/**
 * Corregir un movimiento MANUAL.
 *
 * Semántica PATCH: lo que no viaja en el cuerpo no se toca. Un movimiento con
 * `appointmentId` se rechaza con 400 — ése se corrige desde la cita — y lo
 * mismo hacen `type`/`category`/`amount` en `null` explícito, así que quien
 * llame NO puede dar por hecho que un 400 es un error de formato: el servidor
 * manda un mensaje en español y hay que enseñarlo tal cual.
 *
 * La respuesta 200 es la fila actualizada SIN `include` de `appointment`; por
 * eso no se escribe en la caché a mano, se invalida.
 */
export const updateTransaction = async (
  id: string,
  payload: UpdateTransactionPayload,
): Promise<FinanceTransaction> => {
  const { data } = await api.patch<FinanceTransaction>(`/finance/${id}`, payload);
  return data;
};

/** Borrar un movimiento MANUAL. Mismo criterio que `updateTransaction`. */
export const deleteTransaction = async (
  id: string,
): Promise<{ id: string; deleted: boolean }> => {
  const { data } = await api.delete<{ id: string; deleted: boolean }>(`/finance/${id}`);
  return data;
};

export const fetchOutstanding = async (): Promise<OutstandingResponse> => {
  const { data } = await api.get<OutstandingResponse>('/finance/outstanding');
  return data;
};

export function useFinanceSummary(month: number, year: number) {
  return useQuery({
    queryKey: financeKeys.summary(month, year),
    queryFn: () => fetchFinanceSummary(month, year),
  });
}

export function useFinanceTransactions(
  month: number,
  year: number,
  type?: 'INCOME' | 'EXPENSE',
  page = 1,
) {
  return useQuery({
    queryKey: financeKeys.transactions(month, year, type, page),
    queryFn: () => fetchFinanceTransactions(month, year, type, page),
  });
}

/** Saldos por cobrar por paciente. Compartido por el Resumen y la pestaña. */
export function useOutstanding() {
  return useQuery({
    queryKey: financeKeys.outstanding(),
    queryFn: fetchOutstanding,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

export interface UpdateTransactionVariables {
  id: string;
  payload: UpdateTransactionPayload;
}

/**
 * Corregir un movimiento manual. Invalida `['finance']` entero porque el
 * importe, la categoría o la fecha cambian a la vez el resumen, la gráfica y la
 * página de la tabla — y una fecha corregida puede sacar la fila de este mes.
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateTransactionVariables) =>
      updateTransaction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

/** Borrar un movimiento manual. Misma invalidación que la corrección. */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

/**
 * Sesiones COMPLETED con pago PENDING de un paciente.
 *
 * `GET /finance/outstanding` agrega por paciente y no devuelve los ids de las
 * citas, así que para poder cobrarlas hay que buscarlas en la agenda. El rango
 * arranca en la sesión impagada más antigua que reportó el propio endpoint
 * (con un día de holgura por si el huso del navegador y el del servidor no
 * coinciden) y termina hoy.
 */
export function usePatientPendingSessions(
  patientId: string | null,
  oldestDate: string | null,
) {
  return useQuery({
    queryKey: financeKeys.pendingSessions(patientId ?? 'none'),
    enabled: Boolean(patientId),
    queryFn: async (): Promise<Appointment[]> => {
      const start = oldestDate
        ? subDays(parseISO(oldestDate), 1)
        : subMonths(new Date(), 12);
      const appointments = await fetchAppointmentsByRange(
        format(start, 'yyyy-MM-dd'),
        getTodayDateString(),
      );
      return appointments.filter(
        (apt) =>
          apt.patientId === patientId &&
          apt.status === 'COMPLETED' &&
          apt.paymentStatus === 'PENDING',
      );
    },
  });
}

export interface AppointmentPaymentVariables {
  appointmentId: string;
  payload: UpdatePaymentPayload;
}

/**
 * Registrar, corregir o revertir el cobro de una cita.
 *
 * `PATCH /finance/:id` ya existe, pero RECHAZA con 400 los movimientos que
 * cuelgan de una cita: el dinero de una sesión se toca desde la cita
 * (`PATCH /appointments/:id/payment`), que crea, actualiza o borra el
 * movimiento asociado en el servidor. Dos fuentes de verdad para el mismo
 * importe y el siguiente cambio de estado de la cita pisaría la corrección sin
 * avisar. Por eso invalida las dos familias.
 */
export function useUpdateAppointmentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, payload }: AppointmentPaymentVariables) =>
      updatePayment(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
