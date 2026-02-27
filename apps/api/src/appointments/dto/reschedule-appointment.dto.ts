import { IsISO8601, IsNumber, IsOptional, Min } from 'class-validator';

export class RescheduleAppointmentDto {
    @IsISO8601()
    startTime: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    duration?: number; // In minutes
}
