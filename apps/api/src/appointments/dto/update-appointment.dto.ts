import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AppointmentType } from '#generated/prisma';

export class UpdateAppointmentDto {
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
}
