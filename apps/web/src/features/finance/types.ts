export interface FinanceTransaction {
  id: string;
  clinicianId: string;
  appointmentId?: string;
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
