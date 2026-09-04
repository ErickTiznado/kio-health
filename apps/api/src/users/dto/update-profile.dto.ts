import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  currency?: string;

  // ── Recordatorios ──────────────────────────────────────────────────────

  @IsOptional()
  @IsBoolean()
  remindersEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(4)
  @Max(72)
  reminderLeadHours?: number;

  /** null = segundo toque desactivado. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(24)
  reminderSecondLeadHours?: number | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    // Handle decimal/number conversion for Prisma Decimal type
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value as number;
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  sessionDefaultPrice?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value as number;
  })
  @IsNumber()
  @IsPositive()
  @Min(15)
  sessionDefaultDuration?: number;
}
