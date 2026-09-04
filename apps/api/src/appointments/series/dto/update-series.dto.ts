import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { AppointmentType } from '#generated/prisma';

/**
 * Edición "esta y las siguientes". Cambiar la frecuencia no está soportado:
 * para eso se cancela la serie y se crea una nueva.
 */
export class UpdateSeriesDto {
  /** Nueva hora local del slot (aplica a ocurrencias futuras), formato HH:mm. */
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'timeOfDay debe tener formato HH:mm',
  })
  timeOfDay?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(90)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  /** Acortar o extender la serie. */
  @IsOptional()
  @IsISO8601()
  until?: string;
}
