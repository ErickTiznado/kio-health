import posthog from 'posthog-js';
import type { AnalyticsEvent, EventProperties } from './analytics.events';
import type { User } from '../types/auth.types';
import { isTrialExpired } from './trial';

/**
 * Analítica de producto (PostHog).
 *
 * Sentry ya nos dice qué se rompe. Esto dice qué se usa — que es la pregunta
 * que una beta cerrada tiene que responder y hoy no puede.
 *
 * TRES DECISIONES QUE NO SE TOCAN SIN PENSARLO DOS VECES:
 *
 * 1. `autocapture: false`. Por defecto PostHog registra el texto del elemento
 *    que se clica. En Kio ese texto es el nombre de un paciente, un
 *    diagnóstico o un fragmento de nota. Autocapture aquí no es "métricas
 *    gratis", es una fuga de datos clínicos. Todo evento es explícito.
 *
 * 2. Sin grabación de sesión. Misma razón, en vídeo.
 *
 * 3. Toda URL pasa por `sanitizePath()` antes de salir. Las rutas de Kio
 *    llevan identificadores (`/patients/<uuid>`, `/session/<uuid>`) y tokens
 *    (`/p/<token>`, `/reset-password?token=`). Un `$current_url` crudo es un
 *    identificador de paciente y un token de portal viajando a un tercero.
 *    El saneado se aplica dos veces —al capturar y en `sanitize_properties`—
 *    porque la segunda red atrapa lo que PostHog rellena por su cuenta.
 *
 * Sin `VITE_PUBLIC_POSTHOG_KEY` el módulo entero es un no-op: en local no se
 * manda nada, y los eventos se imprimen por consola para poder verificarlos.
 */

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

let enabled = false;

/* ── Saneado de rutas ────────────────────────────────────────────────────── */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Segmentos que siempre son un identificador, sea cual sea su forma. */
const ID_BEARING_PARENTS = new Set(['patients', 'session', 'join', 'p', 'appointments']);

/**
 * Convierte una ruta concreta en su patrón: `/patients/8f3a-...` -> `/patients/:id`.
 *
 * Descarta query y hash enteros sin mirarlos. Es deliberado: ahí es donde
 * viven los tokens de invitación y de reseteo de contraseña, y ningún dato de
 * producto que necesitemos justifica el riesgo de dejarlos pasar.
 */
export function sanitizePath(rawUrl: string): string {
  // Acepta tanto una ruta suelta como una URL absoluta.
  let pathname = rawUrl;
  try {
    if (/^https?:\/\//i.test(rawUrl)) pathname = new URL(rawUrl).pathname;
  } catch {
    return '/desconocida';
  }

  pathname = pathname.split('?')[0].split('#')[0];

  const segments = pathname.split('/');

  return segments
    .map((segment, index) => {
      if (!segment) return segment;

      const parent = segments[index - 1];
      if (parent && ID_BEARING_PARENTS.has(parent)) return ':id';

      if (UUID_RE.test(segment)) return ':id';
      // Tokens opacos: largos y sin parecerse a una palabra de ruta.
      if (segment.length >= 16) return ':id';
      if (/^\d+$/.test(segment)) return ':id';

      return segment;
    })
    .join('/');
}

/* ── Ciclo de vida ───────────────────────────────────────────────────────── */

export function initAnalytics(): void {
  if (enabled) return;

  if (!POSTHOG_KEY) {
    if (import.meta.env.DEV) {
      console.info('[analytics] sin VITE_PUBLIC_POSTHOG_KEY — eventos solo por consola');
    }
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Ver decisión 1 arriba. No activar "para ver más": ese "más" es PII clínica.
    autocapture: false,
    disable_session_recording: true,
    // Los pageviews los mandamos nosotros, con la ruta ya saneada.
    capture_pageview: false,
    capture_pageleave: true,
    // Solo creamos perfil de persona para clínicos identificados; los visitantes
    // anónimos de la landing no generan uno.
    person_profiles: 'identified_only',
    respect_dnt: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
    // Segunda red: cualquier propiedad con forma de URL sale saneada, venga de
    // donde venga —incluidas las que rellena la propia librería.
    sanitize_properties: (properties) => {
      const scrubbed: Record<string, unknown> = { ...properties };
      for (const key of ['$current_url', '$referrer', '$pathname', '$initial_current_url']) {
        const value = scrubbed[key];
        if (typeof value === 'string' && value) scrubbed[key] = sanitizePath(value);
      }
      return scrubbed;
    },
  });

  enabled = true;
}

/**
 * Asocia los eventos al clínico. Su correo va aquí a propósito: en una beta
 * cerrada de diez personas, un embudo que no te deja llamar por teléfono a
 * quien se atascó no sirve para nada. Es dato del profesional, nunca del
 * paciente.
 */
export function identifyUser(user: User): void {
  if (!enabled) return;

  posthog.identify(user.id, {
    email: user.email,
    name: user.fullName ?? undefined,
    plan: user.profile?.plan ?? 'sin_perfil',
    clinic_role: user.clinicRole ?? 'sin_clinica',
    has_completed_onboarding: Boolean(user.profile),
    currency: user.profile?.currency,
    // Como propiedad de persona, no de evento: convierte "¿a quién se le acaba
    // la prueba esta semana?" en un filtro, que es la lista a la que hay que
    // llamar por teléfono en una beta cerrada.
    trial_ends_at: user.profile?.trialEndsAt ?? null,
    is_trialing: !isTrialExpired(user.profile?.trialEndsAt),
  });
}

export function resetAnalytics(): void {
  if (!enabled) return;
  posthog.reset();
}

/* ── Captura ─────────────────────────────────────────────────────────────── */

/**
 * Único punto de salida de eventos. Tipado contra el catálogo: un nombre que no
 * esté en `analytics.events.ts` no compila.
 */
export function capture<E extends AnalyticsEvent>(event: E, properties: EventProperties[E]): void {
  if (!enabled) {
    if (import.meta.env.DEV) console.debug('[analytics]', event, properties);
    return;
  }
  posthog.capture(event, properties);
}

export function capturePageview(pathname: string): void {
  const route = sanitizePath(pathname);
  if (!enabled) {
    if (import.meta.env.DEV) console.debug('[analytics] $pageview', route);
    return;
  }
  posthog.capture('$pageview', { $current_url: route, route });
}

/** Para el widget de feedback y cualquier sitio que necesite la ruta ya limpia. */
export function currentRoute(): string {
  return sanitizePath(window.location.pathname);
}
