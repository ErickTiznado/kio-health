import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type {
  FinanceSummary,
  FinanceTransactionsResponse,
  CreateTransactionPayload,
} from '../types';

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

export const createTransaction = async (payload: CreateTransactionPayload) => {
  const { data } = await api.post('/finance', payload);
  return data;
};

export function useFinanceSummary(month: number, year: number) {
  return useQuery({
    queryKey: ['finance', 'summary', month, year],
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
    queryKey: ['finance', 'transactions', month, year, type, page],
    queryFn: () => fetchFinanceTransactions(month, year, type, page),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}
