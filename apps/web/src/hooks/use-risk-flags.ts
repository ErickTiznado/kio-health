import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { RiskFlag } from '../types/patients.types';
import { riskFlagKeys } from '../lib/query-keys';
import { toast } from 'sonner';

const fetchRiskFlags = async (patientId: string): Promise<RiskFlag> => {
  const { data } = await api.get<RiskFlag>(`/patients/${patientId}/risk-flags`);
  return data;
};

const resolveRiskFlags = async ({
  patientId,
  flagTypesToResolve,
}: {
  patientId: string;
  flagTypesToResolve: string[];
}): Promise<RiskFlag> => {
  const { data } = await api.patch<RiskFlag>(
    `/patients/${patientId}/risk-flags/resolve`,
    { flagTypesToResolve }
  );
  return data;
};

export const useRiskFlags = (patientId: string) => {
  return useQuery({
    queryKey: riskFlagKeys.patient(patientId),
    queryFn: () => fetchRiskFlags(patientId),
    enabled: !!patientId,
  });
};

export const useResolveRiskFlags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resolveRiskFlags,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: riskFlagKeys.patient(data.patientId),
      });
      toast.success('Banderas de riesgo resueltas');
    },
    onError: () => {
      toast.error('Error al resolver banderas de riesgo');
    },
  });
};
