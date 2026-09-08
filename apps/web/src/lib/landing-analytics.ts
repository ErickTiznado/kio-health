/**
 * Analítica propia de la landing pública.
 *
 * Deliberadamente separada de `analytics.ts` (PostHog), que cubre la app
 * autenticada. Aquí la pregunta es otra y mucho más pequeña: de la gente que
 * llega desde Instagram, ¿cuánta entra, qué secciones ve, cuánto se queda y
 * cuánta acaba en la lista de espera?
 *
 * TRES DECISIONES QUE SOSTIENEN EL DISEÑO:
 *
 * 1. **Sin cookies.** El id de visita vive en `sessionStorage`: una pestaña es
 *    una visita, y al cerrarla desaparece. No es un identificador persistente,
 *    así que no hay banner de consentimiento que poner ni a nadie a quien
 *    seguir entre días. El precio es que no distinguimos visitante recurrente,
 *    y a cambio la tabla no contiene dato personal.
 *
 * 2. **No se manda IP ni user-agent.** Solo `device` e `inAppBrowser`, ya
 *    derivados aquí. El servidor no ve nada más de lo que el visitante es.
 *
 * 3. **Se acumula y se manda por beacon**, no un POST por evento. Un scroll no
 *    merece una petición; lo que importa es el resumen al final de la visita.
 */

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

const TRACK_URL = `${API_BASE}/landing/track`;
const STORAGE_KEY = 'kio_landing_visit';

/** Debe coincidir con `LANDING_SECTIONS` del DTO de la API. */
export const LANDING_SECTIONS = [
  'hero',
  'pacientes',
  'dashboard',
  'diferencia',
  'lista-de-espera',
] as const;

export type LandingSection = (typeof LANDING_SECTIONS)[number];

export interface VisitPayload {
  visitId: string;
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerHost?: string;
  device: 'movil' | 'escritorio';
  inAppBrowser: boolean;
  sectionsSeen: LandingSection[];
  maxScrollPct: number;
  dwellMs: number;
  waitlist: boolean;
}

/* ── Identidad de la visita ──────────────────────────────────────────────── */

/**
 * Id de visita en `sessionStorage`. Si el almacenamiento no está disponible
 * (modo privado, cookies de sitio bloqueadas) devuelve `null` y la visita
 * simplemente no se registra: un contador no justifica romperle la landing a
 * nadie.
 */
export function getVisitId(): string | null {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return null;
  }
}

/* ── Procedencia ─────────────────────────────────────────────────────────── */

/** Hosts que sabemos reconocer; el resto se guarda por su host a secas. */
const KNOWN_HOSTS: Array<[RegExp, string]> = [
  [/instagram\./i, 'instagram'],
  [/facebook\.|fb\./i, 'facebook'],
  [/google\./i, 'google'],
  [/^t\.co$|twitter\.|x\.com$/i, 'twitter'],
  [/linkedin\./i, 'linkedin'],
  [/tiktok\./i, 'tiktok'],
  [/whatsapp|wa\.me/i, 'whatsapp'],
];

export interface DetectedOrigin {
  source: string;
  referrerHost?: string;
  inAppBrowser: boolean;
}

/**
 * De dónde viene esta visita.
 *
 * Orden: `utm_source` → `?ref=` → host del referrer → navegador embebido →
 * `directo`.
 *
 * **Esto es lo que hay que entender para medir Instagram**: el navegador
 * in-app de Instagram normalmente manda el referrer vacío, así que confiar en
 * `document.referrer` contaría como "directo" casi todo el tráfico de la bio.
 * La fuente fiable es poner `?utm_source=instagram` en el enlace de la
 * biografía. La detección de navegador embebido es solo la red de seguridad
 * para cuando ese parámetro se pierde por el camino.
 */
export function detectSource(
  search: string,
  referrer: string,
  userAgent: string,
  ownHost: string,
): DetectedOrigin {
  const params = new URLSearchParams(search);
  const inAppBrowser = /Instagram|FBAN|FBAV/i.test(userAgent);

  let referrerHost: string | undefined;
  if (referrer) {
    try {
      referrerHost = new URL(referrer).host;
    } catch {
      referrerHost = undefined;
    }
  }

  const explicit = params.get('utm_source') || params.get('ref');
  if (explicit) {
    return { source: normalize(explicit), referrerHost, inAppBrowser };
  }

  if (referrerHost && referrerHost !== ownHost) {
    const host = referrerHost;
    const known = KNOWN_HOSTS.find(([pattern]) => pattern.test(host));
    return {
      source: known ? known[1] : normalize(host),
      referrerHost,
      inAppBrowser,
    };
  }

  // Sin referrer pero dentro del navegador de Instagram: es tráfico de la app,
  // aunque el enlace de la bio no llevara el utm.
  if (inAppBrowser) return { source: 'instagram', referrerHost, inAppBrowser };

  return { source: 'directo', referrerHost, inAppBrowser };
}

function normalize(value: string): string {
  return value.trim().toLowerCase().slice(0, 80);
}

/* ── Acumulador de la visita ─────────────────────────────────────────────── */

/**
 * Estado de la visita en curso.
 *
 * El tiempo se cuenta solo mientras la pestaña está visible: `Date.now()` a
 * secas convertiría una pestaña abandonada en un cuarto de hora de "lectura", y
 * ese es exactamente el número que haría inútil la métrica.
 */
export class LandingVisitTracker {
  private readonly sections = new Set<LandingSection>();
  private maxScrollPct = 0;
  private accumulatedMs = 0;
  private visibleSince: number | null = null;
  private waitlist = false;

  private readonly visitId: string;
  private readonly origin: DetectedOrigin;
  private readonly utm: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  private readonly device: 'movil' | 'escritorio';
  private readonly now: () => number;

  constructor(
    visitId: string,
    origin: DetectedOrigin,
    utm: { utmSource?: string; utmMedium?: string; utmCampaign?: string },
    device: 'movil' | 'escritorio',
    now: () => number = () => Date.now(),
  ) {
    this.visitId = visitId;
    this.origin = origin;
    this.utm = utm;
    this.device = device;
    this.now = now;
  }

  startVisible(): void {
    if (this.visibleSince === null) this.visibleSince = this.now();
  }

  stopVisible(): void {
    if (this.visibleSince === null) return;
    this.accumulatedMs += this.now() - this.visibleSince;
    this.visibleSince = null;
  }

  /** Milisegundos con la pestaña a la vista, incluido el tramo abierto. */
  dwellMs(): number {
    const open = this.visibleSince === null ? 0 : this.now() - this.visibleSince;
    return Math.round(this.accumulatedMs + open);
  }

  markSection(section: LandingSection): void {
    this.sections.add(section);
  }

  markScroll(pct: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    if (clamped > this.maxScrollPct) this.maxScrollPct = clamped;
  }

  markWaitlist(): void {
    this.waitlist = true;
  }

  payload(): VisitPayload {
    return {
      visitId: this.visitId,
      source: this.origin.source,
      ...this.utm,
      referrerHost: this.origin.referrerHost,
      device: this.device,
      inAppBrowser: this.origin.inAppBrowser,
      sectionsSeen: [...this.sections],
      maxScrollPct: this.maxScrollPct,
      dwellMs: this.dwellMs(),
      waitlist: this.waitlist,
    };
  }
}

/* ── Envío ───────────────────────────────────────────────────────────────── */

/**
 * Manda el resumen.
 *
 * No pasa por el cliente axios de `api.ts` a propósito, y es la única
 * excepción a esa regla en el frontend: esto se dispara en `pagehide`, donde
 * una petición normal se cancela al descargarse la página. `sendBeacon` es lo
 * único que el navegador garantiza que sale. El endpoint es `@Public()` porque
 * un beacon tampoco lleva la sesión, y aquí no hace falta.
 *
 * Falla en silencio: la analítica nunca puede romper la landing.
 */
export function sendVisit(payload: VisitPayload): void {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(
        TRACK_URL,
        new Blob([body], { type: 'application/json' }),
      );
      return;
    }
    void fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Sin analítica, pero con landing.
  }
}
