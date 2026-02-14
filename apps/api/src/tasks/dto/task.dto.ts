import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
