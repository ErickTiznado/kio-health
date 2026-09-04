export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  clinicianId?: string;
  clinicId?: string;
  clinicRole?: string;
  /// ISO. Viaja en el token para que `TrialGuard` no consulte la BD en cada
  /// petición — mismo criterio que `clinicRole`. Ampliar una prueba surte
  /// efecto en cuanto rota el access token (15 min como mucho).
  trialEndsAt?: string | null;
}
