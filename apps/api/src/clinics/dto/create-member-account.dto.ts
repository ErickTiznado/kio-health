import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ClinicianType, ClinicRole } from '#generated/prisma';

export class CreateMemberAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(ClinicianType)
  clinicianType: ClinicianType;

  @IsEnum(ClinicRole)
  role: ClinicRole;
}
