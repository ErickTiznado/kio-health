import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { FinanceSummary, CreateTransactionPayload } from '../types';

// Assuming global axios instance or similar. Using direct axios for simplicity based on prompt context.
// Actually, context says `apps/web/src/lib/api.ts` might exist or similar.
// I'll assume axios import is standard. If project uses a custom client, I should use it.
// Checking `package.json`, axios is there.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchFinanceSummary = async (month: number, year: number): Promise<FinanceSummary> => {
  const { data } = await axios.get(`${API_URL}/finance/summary`, {
    params: { month, year },
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, // Basic auth handling
  });
  return data;
};

export const createTransaction = async (payload: CreateTransactionPayload) => {
  const { data } = await axios.post(`${API_URL}/finance`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
  });
  return data;
};

export function useFinanceSummary(month: number, year: number) {
  return useQuery({
    queryKey: ['finance', month, year],
    queryFn: () => fetchFinanceSummary(month, year),
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
