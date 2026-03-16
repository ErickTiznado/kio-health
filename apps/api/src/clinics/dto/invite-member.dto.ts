import { IsEmail, IsEnum } from 'class-validator';
import { ClinicRole } from '#generated/prisma';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(ClinicRole)
  role: ClinicRole;
}
