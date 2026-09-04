import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryDaySummaryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'from must be in YYYY-MM-DD format',
  })
  from: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'to must be in YYYY-MM-DD format',
  })
  to: string;

  /**
   * IANA timezone of the clinician (e.g. `America/Mexico_City`). Days are
   * bucketed in this zone; without it the server would group by its own clock
   * and hand back a calendar that belongs to nobody.
   */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9+_\-/]{1,64}$/, {
    message: 'tz must be an IANA timezone',
  })
  tz?: string;
}
