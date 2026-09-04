import { IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

/**
 * Rango OPCIONAL para `GET /appointments/pending-notes-count`.
 *
 * Sin parametros el endpoint sigue devolviendo el historico completo — es como
 * lo llama el dashboard hoy y no debe cambiar. Con rango, el conteo comparte
 * techo temporal con la agenda (`GET /appointments?from&to&tz`), que es el
 * unico modo de que los dos numeros hablen del mismo periodo.
 *
 * `from` y `to` van juntos o no van: medio rango es casi siempre un bug del
 * llamante, y aceptarlo en silencio devolveria un total que nadie pidio.
 */
export class QueryPendingNotesDto {
  @ValidateIf(
    (o: QueryPendingNotesDto) => o.from !== undefined || o.to !== undefined,
  )
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message:
      'from must be in YYYY-MM-DD format (and is required when to is present)',
  })
  from?: string;

  @ValidateIf(
    (o: QueryPendingNotesDto) => o.from !== undefined || o.to !== undefined,
  )
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message:
      'to must be in YYYY-MM-DD format (and is required when from is present)',
  })
  to?: string;

  /**
   * IANA timezone of the clinician (e.g. `America/Mexico_City`). Los limites de
   * dia se calculan en esta zona, no en la del servidor. Se ignora si no hay
   * rango.
   */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9+_\-/]{1,64}$/, {
    message: 'tz must be an IANA timezone',
  })
  tz?: string;
}
