import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Longitud máxima de una tarea. El input del widget usa el mismo valor.
export const TASK_DESCRIPTION_MAX_LENGTH = 280;

// Recorta antes de validar: así `"   "` falla en @IsNotEmpty en vez de
// persistirse como una tarea en blanco.
const trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

export class CreateTaskDto {
  @trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(TASK_DESCRIPTION_MAX_LENGTH)
  description: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(TASK_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
