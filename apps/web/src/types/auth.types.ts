export interface ClinicianProfile {
  id: string;
  type: 'PSYCHOLOGIST' | 'NUTRITIONIST';
  licenseNumber: string | null;
  currency: string;
  sessionDefaultDuration: number;
  sessionDefaultPrice: number;
}

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'CLINICIAN';
  createdAt: string;
  profile: ClinicianProfile | null;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
