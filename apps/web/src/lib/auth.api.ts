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

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { token, newPassword });
}
