import { IsNotEmpty, IsString, IsOptional, IsDateString, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class EmergencyContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  relation?: string;
}

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  clinicalContext?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @IsOptional()
  @IsString({ each: true })
  treatmentGoals?: string[];
}
