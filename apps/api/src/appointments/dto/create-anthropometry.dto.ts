import { IsNumber, IsOptional } from 'class-validator';

export class CreateAnthropometryDto {
  @IsNumber()
  weight: number;

  @IsNumber()
  height: number;

  @IsOptional()
  @IsNumber()
  bodyFat?: number;

  @IsOptional()
  @IsNumber()
  waist?: number;

  @IsOptional()
  @IsNumber()
  hip?: number;
}
