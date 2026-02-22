import {
    IsEnum,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import { AppointmentType } from '#generated/prisma';

export class CreateAppointmentDto {
    @IsUUID()
    patientId: string;

    @IsISO8601()
    startTime: string;

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

    @IsNumber()
    @Min(1)
    @IsOptional()
    duration?: number;
}
