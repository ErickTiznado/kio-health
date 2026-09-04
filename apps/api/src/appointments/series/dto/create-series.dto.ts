import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { AppointmentType, RecurrenceFrequency } from '#generated/prisma';

export class CreateSeriesDto {
  @IsUUID()
  patientId: string;

  /** Primera ocurrencia — define día de la semana y hora de toda la serie. */
  @IsISO8601()
  startTime: string;

  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(15)
  @Max(90)
  @IsOptional()
  duration?: number; // In minutes

  /** Condición de fin A: última fecha posible (inclusive). */
  @IsISO8601()
  @IsOptional()
  until?: string;

  /** Condición de fin B: número total de sesiones. */
  @IsInt()
  @Min(1)
  @Max(104)
  @IsOptional()
  maxOccurrences?: number;
}
