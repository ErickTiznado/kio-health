import { IsEnum } from 'class-validator';
import { ClinicRole } from '#generated/prisma';

export class UpdateMemberRoleDto {
  @IsEnum(ClinicRole)
  role: ClinicRole;
}
