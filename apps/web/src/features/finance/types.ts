export interface FinanceTransaction {
  id: string;
  clinicianId: string;
  appointmentId?: string | null;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description?: string;
  date: string;
  appointment?: {
    patient: {
      fullName: string;
    };
    paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | null;
  };
}

export interface PaymentMethodBreakdown {
  CASH: number;
  CARD: number;
  TRANSFER: number;
}

export interface PreviousMonthSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  projection: number;
  previousMonth: PreviousMonthSummary;
  paymentMethodBreakdown: PaymentMethodBreakdown;
  transactions: FinanceTransaction[];
}

export interface FinanceTransactionsResponse {
  data: FinanceTransaction[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface CreateTransactionPayload {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description?: string;
  date?: string;
}

/**
 * Cuerpo de `PATCH /finance/:id`. Semántica PATCH: lo que no viaja no se toca.
 *
 * Solo vale para movimientos MANUALES. Uno nacido del cobro de una cita lo
 * gobierna el ciclo de la cita y el servidor lo rechaza con un 400 — igual que
 * `DELETE /finance/:id`.
 *
 * Detalles del contrato que el manejo de errores no puede ignorar:
 * - `appointmentId` NO se acepta; el vínculo con una cita lo escribe solo el
 *   servidor.
 * - `type`, `category` y `amount` NO admiten `null` explícito (columnas NOT
 *   NULL): el servidor responde 400 diciendo qué campo falla.
 * - `description: null` sí es legítimo y borra el texto.
 * - `date: ''` significa «no la toques»; un día civil inexistente
 *   (`2026-02-31`) también sale por un 400.
 * - La respuesta 200 es la fila actualizada SIN `include` de `appointment`.
 */
export interface UpdateTransactionPayload {
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  amount?: number;
  description?: string | null;
  /** Día civil `YYYY-MM-DD`. */
  date?: string;
}

/** Saldo pendiente agregado por paciente (GET /finance/outstanding). */
export interface OutstandingEntry {
  patientId: string;
  fullName: string;
  patientStatus: 'ACTIVE' | 'ARCHIVED';
  total: number;
  sessions: number;
  /** ISO de la sesión impagada más antigua. */
  oldestDate: string | null;
}

export interface OutstandingResponse {
  data: OutstandingEntry[];
  total: number;
}
