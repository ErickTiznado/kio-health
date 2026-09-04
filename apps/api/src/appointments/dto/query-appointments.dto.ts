import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryAppointmentsDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'from must be in YYYY-MM-DD format',
  })
  from?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'to must be in YYYY-MM-DD format',
  })
  to?: string;

  /**
   * IANA timezone of the clinician (e.g. `America/Mexico_City`). The day
   * boundaries are computed in this zone, not the server's.
   */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9+_\-/]{1,64}$/, {
    message: 'tz must be an IANA timezone',
  })
  tz?: string;
}
