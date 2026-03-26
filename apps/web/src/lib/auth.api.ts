import { api } from './api';
import type { User } from '../types/auth.types';

export interface CompleteProfilePayload {
  type: 'PSYCHOLOGIST';
  plan: 'INDIVIDUAL' | 'CLINIC';
  licenseNumber?: string;
  currency: string;
  sessionDefaultDuration: number;
  sessionDefaultPrice: number;
}

export async function completeProfile(payload: CompleteProfilePayload): Promise<User> {
  const res = await api.post<{ user: User }>('/auth/complete-profile', payload);
  return res.data.user;
}
