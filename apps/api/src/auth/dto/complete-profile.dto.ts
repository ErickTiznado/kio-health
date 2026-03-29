import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClinicianType, ClinicianPlan } from '#generated/prisma';

export const VALID_CURRENCIES = [
  'USD',
  'MXN',
  'COP',
  'ARS',
  'PEN',
  'CLP',
  'BRL',
  'EUR',
] as const;

export class CompleteProfileDto {
  @IsEnum(ClinicianType)
  type: ClinicianType;

  @IsEnum(ClinicianPlan)
  plan: ClinicianPlan;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsIn(VALID_CURRENCIES, { message: `currency must be one of: ${VALID_CURRENCIES.join(', ')}` })
  currency: string;

  @IsNumber()
  @Min(15)
  @Max(180)
  @Type(() => Number)
  sessionDefaultDuration: number;

  @IsNumber()
  @Min(0)
  @Max(99999)
  @Type(() => Number)
  sessionDefaultPrice: number;
}
