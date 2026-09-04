import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const PRACTICE_KINDS = ['INDIVIDUAL', 'CLINICA', 'OTRO'] as const;

export class BetaRequestDto {
  @IsEmail({}, { message: 'Introduce un correo válido' })
  @MaxLength(254)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsIn(PRACTICE_KINDS)
  practiceKind?: (typeof PRACTICE_KINDS)[number];
}
