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
  };
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: FinanceTransaction[];
}

export interface CreateTransactionPayload {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description?: string;
  date?: string;
}
