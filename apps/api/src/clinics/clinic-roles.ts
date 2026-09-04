import { ClinicRole } from '#generated/prisma';

/**
 * Roles que una clínica puede CONCEDER a otra persona.
 *
 * `OWNER` queda fuera a propósito, y no por purismo: hoy la propiedad no se
 * transfiere, se DUPLICA. `removeMember()` se niega a borrar a un OWNER,
 * `leaveClinic()` se niega a sacarlo y `updateMemberRole()` se niega a cambiarle
 * el rol, así que un segundo OWNER es irrevocable — y `ClinicOwnerGuard` le abre
 * `DELETE /clinics/mine`, que borra la clínica en cascada.
 *
 * Con `@IsEnum(ClinicRole)` en los DTOs, ese OWNER irrevocable lo podía crear un
 * ADMIN: `POST /clinics/mine/invitations` solo exige `ClinicAdminGuard`, y desde
 * que existe `POST /clinics/join/register` la invitación ya no necesita una
 * cuenta previa — el ADMIN emitía la invitación OWNER, la canjeaba él mismo (el
 * token se le devuelve en la respuesta) y elegía la contraseña. Escalada de
 * ADMIN a OWNER irrevocable, con borrado de clínica al final.
 *
 * La transferencia de propiedad de verdad —degradar al OWNER actual y promover a
 * otro, en una transacción— es un endpoint aparte con `ClinicOwnerGuard` que
 * todavía no existe. Mientras no exista, ninguna superficie concede OWNER.
 */
export const GRANTABLE_CLINIC_ROLES = [
  ClinicRole.ADMIN,
  ClinicRole.MEMBER,
] as const;

export type GrantableClinicRole = (typeof GRANTABLE_CLINIC_ROLES)[number];

export function isGrantableClinicRole(
  role: ClinicRole,
): role is GrantableClinicRole {
  return (GRANTABLE_CLINIC_ROLES as readonly ClinicRole[]).includes(role);
}

/** Mensaje único: el mismo motivo se rechaza al emitir y al canjear. */
export const OWNER_NOT_GRANTABLE_MESSAGE =
  'La propiedad de la clínica no se puede conceder por invitación ni por cambio de rol.';
