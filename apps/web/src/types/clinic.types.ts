export type ClinicRole = 'OWNER' | 'ADMIN' | 'MEMBER';

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

export interface InvitationLink {
  token: string;
  link: string;
}

export interface ClinicPatient {
  id: string;
  fullName: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'WAITLIST';
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
  role: ClinicRole;
}

export interface CreateMemberAccountDto {
  email: string;
  password: string;
  clinicianType: 'PSYCHOLOGIST';
  role: ClinicRole;
}
