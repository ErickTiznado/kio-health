import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Secciones de la landing, en el orden en que aparecen. Lista cerrada a
 * propósito: el endpoint es anónimo, y sin lista blanca cualquiera puede
 * llenar la columna de cadenas inventadas y arruinar el embudo.
 *
 * Si se añade una sección a `LandingPage.tsx`, se añade aquí y en
 * `LANDING_SECTIONS` del cliente. Los dos nombres tienen que coincidir.
 */
export const LANDING_SECTIONS = [
  'hero',
  'pacientes',
  'dashboard',
  'diferencia',
  'lista-de-espera',
] as const;

export type LandingSection = (typeof LANDING_SECTIONS)[number];

export const NET_TYPES = ['slow-2g', '2g', '3g', '4g'] as const;

/** Dos minutos. Por encima de eso no es una carga, es un reloj desajustado. */
const MAX_LOAD_MS = 2 * 60 * 1000;

/** Cuatro horas. Por encima de eso es una pestaña olvidada, no una lectura. */
const MAX_DWELL_MS = 4 * 60 * 60 * 1000;

export class TrackLandingVisitDto {
  /** Generado en el cliente y guardado en `sessionStorage`. Clave del upsert. */
  @IsUUID()
  visitId: string;

  @IsString()
  @MaxLength(80)
  source: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  utmSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  utmMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  referrerHost?: string;

  @IsIn(['movil', 'escritorio'])
  device: 'movil' | 'escritorio';

  @IsOptional()
  @IsBoolean()
  inAppBrowser?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(LANDING_SECTIONS.length)
  @IsIn(LANDING_SECTIONS, { each: true })
  sectionsSeen?: LandingSection[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  maxScrollPct?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_DWELL_MS)
  dwellMs?: number;

  @IsOptional()
  @IsBoolean()
  waitlist?: boolean;

  /**
   * Cuanto tardo la pagina en ser utilizable, y en pintar por primera vez.
   *
   * Sin esto `dwellMs` miente por omision: empieza a contar cuando React monta,
   * asi que la espera previa —que es donde se pierde a la gente— era invisible.
   * El tope de dos minutos descarta lecturas absurdas de relojes desajustados.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_LOAD_MS)
  loadMs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_LOAD_MS)
  fcpMs?: number;

  /** Lista cerrada: es lo que declara la Network Information API. */
  @IsOptional()
  @IsIn(NET_TYPES)
  netType?: (typeof NET_TYPES)[number];
}
