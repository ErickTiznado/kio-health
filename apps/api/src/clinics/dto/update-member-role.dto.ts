import { IsIn } from 'class-validator';
import {
  GRANTABLE_CLINIC_ROLES,
  OWNER_NOT_GRANTABLE_MESSAGE,
  type GrantableClinicRole,
} from '../clinic-roles';

export class UpdateMemberRoleDto {
  // Mismo listón que `InviteMemberDto`: promover a OWNER no transfiere la
  // propiedad, crea un segundo propietario irrevocable. Ver `clinic-roles.ts`.
  @IsIn(GRANTABLE_CLINIC_ROLES, { message: OWNER_NOT_GRANTABLE_MESSAGE })
  role: GrantableClinicRole;
}
