import { api } from './api';

export type PracticeKind = 'INDIVIDUAL' | 'CLINICA' | 'OTRO';

export interface BetaRequestPayload {
  email: string;
  fullName?: string;
  practiceKind?: PracticeKind;
}

/** Alta en la lista de espera de la beta. Endpoint público y throttled. */
export async function requestBetaAccess(
  payload: BetaRequestPayload,
): Promise<{ received: true }> {
  const { data } = await api.post<{ received: true }>(
    '/auth/beta-request',
    payload,
  );
  return data;
}
