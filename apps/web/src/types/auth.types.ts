export interface ClinicianProfile {
  id: string;
  type: 'PSYCHOLOGIST';
  licenseNumber: string | null;
  currency: string;
  sessionDefaultDuration: number;
  sessionDefaultPrice: number;
  googleIntegration?: { id: string } | null;
  plan: 'INDIVIDUAL' | 'CLINIC';
  /**
   * Fin de la prueba de 15 días, en ISO. `null` significa sin límite —
   * cuentas internas—, nunca "caducada". El servidor manda: esto solo pinta.
   */
  trialEndsAt?: string | null;
  remindersEnabled?: boolean;
  reminderLeadHours?: number;
  reminderSecondLeadHours?: number | null;
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
  /**
   * Qué hace el servidor con la prueba caducada. Es configuración del backend
   * (`TRIAL_EXPIRED_MODE`), no una preferencia del usuario: viaja aquí para que
   * el frontend pinte la pantalla correcta desde el primer render en vez de
   * descubrirlo al recibir el primer 403.
   */
  trialLockMode?: 'READ_ONLY' | 'HARD';
}

export interface LoginResponse {
  user: User;
}
