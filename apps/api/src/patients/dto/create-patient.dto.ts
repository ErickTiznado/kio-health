import { IsNotEmpty, IsString, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

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
}
