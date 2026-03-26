import { IsISO8601, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsISO8601()
  startTime: string;

  @IsNumber()
  @Min(15)
  @Max(90)
  @IsOptional()
  duration?: number; // In minutes
}
