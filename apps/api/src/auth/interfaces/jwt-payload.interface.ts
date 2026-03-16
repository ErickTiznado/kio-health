export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  clinicianId?: string;
  clinicId?: string;
  clinicRole?: string;
}
