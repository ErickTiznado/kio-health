import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

/**
 * Alta de cuenta canjeando una invitación de clínica.
 *
 * No lleva `email` a propósito: el correo sale de `invitedEmail` de la propia
 * invitación, así que el enlace sigue siendo nominativo y quien lo reciba no
 * puede estrenar la cuenta con otra dirección.
 *
 * La regla de contraseña es la misma que la de `SignupDto` (mayúscula + dígito).
 * El DTO que esto sustituye (`create-member-account.dto.ts`) solo exigía 8
 * caracteres: dos puertas de entrada al mismo producto con distinto listón es
 * exactamente el hueco por el que se cuelan las contraseñas débiles.
 */
export class RegisterFromInvitationDto {
  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Se requiere un token de invitación válido' })
  token!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula y un número',
  })
  password!: string;

  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  fullName!: string;
}
