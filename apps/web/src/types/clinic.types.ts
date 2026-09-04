export type ClinicRole = 'OWNER' | 'ADMIN' | 'MEMBER';

/**
 * Roles que una clínica puede CONCEDER a otra persona.
 *
 * `OWNER` queda fuera y no es cosmético: el backend lo rechaza en el DTO de
 * invitación, en el de cambio de rol y también AL CANJEAR
 * (`assertInvitedRoleIsGrantable`, 403). Hoy la propiedad no se transfiere, se
 * duplicaría — y un segundo propietario sería irrevocable. Ninguna superficie
 * lo ofrece; ver `apps/api/src/clinics/clinic-roles.ts`.
 */
export type GrantableClinicRole = 'ADMIN' | 'MEMBER';

export interface ClinicMember {
  id: string;
  clinicId: string;
  clinicianId: string;
  role: ClinicRole;
  joinedAt: string;
  clinician: {
    id: string;
    user: { email: string };
  };
}

export interface Clinic {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: ClinicMember[];
}

export interface ClinicInvitation {
  id: string;
  clinicId: string;
  invitedEmail: string;
  invitedRole: ClinicRole;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

/**
 * Respuesta de `POST /clinics/mine/invitations`.
 *
 * `emailSent` es la mitad honesta del contrato: el backend crea la invitación
 * aunque el correo no salga, así que una pantalla que solo dijera "invitación
 * enviada" estaría afirmando un envío que puede no haber ocurrido. El enlace
 * es el camino principal y `emailSent: false` obliga a decirlo.
 *
 * `expiresAt` viene del servidor (48 horas desde que se genera): no se calcula
 * en el cliente para que la fecha que se enseña sea la que de verdad manda.
 */
export interface InvitationLink {
  token: string;
  link: string;
  expiresAt: string;
  emailSent: boolean;
}

/**
 * Respuesta de `GET /clinics/join?token=…` (público).
 *
 * `hasAccount` es el interruptor de `/join/:token`: decide si al invitado se le
 * ofrece crear su cuenta ahí mismo (`POST /clinics/join/register`) o iniciar
 * sesión y canjear (`POST /clinics/join`). `invitedEmail` se ENSEÑA, nunca se
 * pide: el correo lo fija la invitación.
 */
export interface InvitationPreview {
  clinicName: string;
  invitedRole: ClinicRole;
  invitedEmail: string;
  hasAccount: boolean;
  expiresAt: string;
}

export interface ClinicPatient {
  id: string;
  fullName: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  clinicianId: string;
}

export interface ClinicMemberFinance {
  clinicianId: string;
  email: string;
  role: ClinicRole;
  income: number;
  expense: number;
}

export interface CreateClinicDto {
  name: string;
}

export interface InviteMemberDto {
  email: string;
  role: GrantableClinicRole;
}

/**
 * Cuerpo de `POST /clinics/join/register`. Sin campo `email` a propósito: el
 * correo sale de `invitedEmail` de la propia invitación, así que el enlace
 * sigue siendo nominativo.
 */
export interface RegisterFromInvitationDto {
  token: string;
  fullName: string;
  password: string;
}

/** 201 de `POST /clinics/join/register`. No abre sesión ni deja cookies. */
export interface RegisterFromInvitationResult {
  email: string;
  clinicId: string;
  clinicName: string;
  role: ClinicRole;
}
