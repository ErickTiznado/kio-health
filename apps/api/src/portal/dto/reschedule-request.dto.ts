import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RescheduleRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
