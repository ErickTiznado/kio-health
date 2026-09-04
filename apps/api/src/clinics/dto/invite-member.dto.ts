import { IsEmail, IsIn } from 'class-validator';
import {
  GRANTABLE_CLINIC_ROLES,
  OWNER_NOT_GRANTABLE_MESSAGE,
  type GrantableClinicRole,
} from '../clinic-roles';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  // `@IsEnum(ClinicRole)` admitía OWNER, y este endpoint solo exige
  // `ClinicAdminGuard`: un ADMIN podía emitirse a sí mismo una invitación OWNER
  // y canjearla por `POST /clinics/join/register`. Ver `clinic-roles.ts`.
  @IsIn(GRANTABLE_CLINIC_ROLES, { message: OWNER_NOT_GRANTABLE_MESSAGE })
  role: GrantableClinicRole;
}
