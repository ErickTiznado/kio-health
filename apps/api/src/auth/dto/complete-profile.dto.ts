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
import { ClinicianType } from '#generated/prisma';

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

  // `plan` ya no se pide aquí. Elegir modalidad antes de haber visto el
  // producto era una decisión irreversible: INDIVIDUAL dejaba `createClinic`
  // devolviendo 403 para siempre, sin salida self-service. Ahora todo el mundo
  // arranca con prueba de 15 días y elige al final.

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsIn(VALID_CURRENCIES, {
    message: `currency must be one of: ${VALID_CURRENCIES.join(', ')}`,
  })
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
