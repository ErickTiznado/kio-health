export interface ClinicianProfile {
  id: string;
  type: 'PSYCHOLOGIST';
  licenseNumber: string | null;
  currency: string;
  sessionDefaultDuration: number;
  sessionDefaultPrice: number;
  googleIntegration?: { id: string } | null;
  plan: 'INDIVIDUAL' | 'CLINIC';
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: 'ADMIN' | 'CLINICIAN';
  mustChangePassword: boolean;
  createdAt: string;
  profile: ClinicianProfile | null;
  clinicId?: string | null;
  clinicRole?: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
}

export interface LoginResponse {
  user: User;
}
