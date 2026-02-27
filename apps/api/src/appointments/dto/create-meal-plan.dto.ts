import { IsOptional, IsString } from 'class-validator';

export class CreateMealPlanDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}
