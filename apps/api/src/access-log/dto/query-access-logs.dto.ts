import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class QueryAccessLogsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  action?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  /** Fecha (YYYY-MM-DD), inclusiva hasta fin de día. */
  @IsOptional()
  @IsISO8601()
  to?: string;
}
