import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClinicianType } from '#generated/prisma';

export class CompleteProfileDto {
  @IsEnum(ClinicianType)
  type: ClinicianType;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsString()
  currency: string;

  @IsNumber()
  @Min(15)
  @Max(180)
  @Type(() => Number)
  sessionDefaultDuration: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sessionDefaultPrice: number;
}
