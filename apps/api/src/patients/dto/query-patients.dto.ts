import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PatientStatus } from '#generated/prisma';

/**
 * Orden del listado de pacientes.
 *
 * `BALANCE` no es un `orderBy` de Prisma: el saldo pendiente es un agregado de
 * `appointments`, no una columna de `patients`. Sólo se acepta junto a
 * `hasBalance=true`, donde el conjunto a ordenar ya está acotado a los
 * pacientes que deben algo y el orden puede resolverse entero en el servicio.
 * Con cualquier otra combinación el servicio responde 400 en vez de aceptar el
 * parámetro y devolver otro orden en silencio.
 */
export enum PatientsSort {
  RECENT = 'recent',
  BALANCE = 'balance',
}

/**
 * Los query params llegan SIEMPRE como string: `?riskFlag=true` es `'true'`.
 * El `ValidationPipe` global corre con `transform: true` pero sin
 * `enableImplicitConversion`, así que `@IsBoolean()` por sí solo rechazaría
 * cualquier valor que venga por la URL. La coerción tiene que ser explícita.
 *
 * Devuelve el valor original si no reconoce la forma, para que `@IsBoolean()`
 * lo rechace con un 400 en vez de que `?riskFlag=quizas` se cuele como filtro
 * silenciosamente desactivado.
 */
const toOptionalBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return value;
};

export class QueryPatientsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Techo de 500 páginas: cada registro se descifra en servidor, así que un
   * `limit` sin límite es trabajo criptográfico ilimitado a petición de un
   * cliente. 500 es exactamente lo que pide hoy `WIDE_PAGE_LIMIT` en
   * `PatientsPage.tsx` para filtrar en cliente; el tope no rompe ese parche.
   * Cuando el front pase a usar `riskFlag`/`hasBalance` este techo puede bajar.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;

  /**
   * `true` → sólo pacientes con bandera de riesgo ACTIVA.
   * `false` → sólo pacientes sin bandera activa (incluye a los que no tienen
   * fila en `risk_flags`). Ausente → sin filtro.
   */
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  riskFlag?: boolean;

  /**
   * `true` → sólo pacientes con saldo pendiente (> 0).
   * `false` → sólo pacientes sin saldo pendiente. Ausente → sin filtro.
   */
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  hasBalance?: boolean;

  @IsOptional()
  @IsEnum(PatientsSort)
  sort?: PatientsSort;
}
