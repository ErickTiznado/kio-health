/**
 * Forma del usuario que `JwtStrategy.validate()` deja en `request.user`.
 * Es la única fuente de verdad para los decoradores `@CurrentUser()` /
 * `@CurrentClinician()` y para los guards que leen `request.user`.
 */
export interface RequestUser {
  userId: string;
  email: string;
  role: string;
  clinicianId?: string;
  clinicId?: string;
  clinicRole?: string;
  trialEndsAt?: string | null;
}
