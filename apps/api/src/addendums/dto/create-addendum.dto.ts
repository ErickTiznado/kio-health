import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateAddendumDto {
  @IsString()
  @MinLength(1, { message: 'El contenido del anexo no puede estar vacío' })
  content: string;

  @IsOptional()
  @IsString()
  privateNotes?: string;
}
