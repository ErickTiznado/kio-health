import { useEffect, useRef } from 'react';
import {
  detectSource,
  getVisitId,
  LandingVisitTracker,
  sendVisit,
  type LandingSection,
} from '../lib/landing-analytics';

/** Atributo que marca una sección medible en `LandingPage.tsx`. */
export const SECTION_ATTR = 'data-landing-section';

/**
 * Instrumenta la landing pública.
 *
 * Monta el observador de secciones, el máximo de scroll y el contador de tiempo
 * visible, y manda el resumen por beacon.
 *
 * Se manda dos veces como mínimo, y es intencionado:
 *
 * - **Al entrar**, para que la visita cuente aunque el usuario cierre de golpe.
 *   Sin esto, todo el que rebota en dos segundos —justo lo que hay que medir
 *   del tráfico de Instagram— sería invisible.
 * - **Al ocultarse la pestaña** (`visibilitychange` a `hidden` y `pagehide`),
 *   con el tiempo y las secciones ya acumuladas. En móvil `unload` no se
 *   dispara de forma fiable; `pagehide` sí.
 *
 * El servidor hace upsert quedándose con el máximo, así que repetir el envío
 * nunca resta.
 */
export function useLandingAnalytics(): {
  markWaitlist: () => void;
} {
  const trackerRef = useRef<LandingVisitTracker | null>(null);

  useEffect(() => {
    const visitId = getVisitId();
    // Sin `sessionStorage` no hay visita que registrar. La landing sigue igual.
    if (!visitId) return;

    const params = new URLSearchParams(window.location.search);
    const origin = detectSource(
      window.location.search,
      document.referrer,
      navigator.userAgent,
      window.location.host,
    );

    const tracker = new LandingVisitTracker(
      visitId,
      origin,
      {
        utmSource: params.get('utm_source') ?? undefined,
        utmMedium: params.get('utm_medium') ?? undefined,
        utmCampaign: params.get('utm_campaign') ?? undefined,
      },
      window.matchMedia('(max-width: 767px)').matches ? 'movil' : 'escritorio',
    );
    trackerRef.current = tracker;

    tracker.startVisible();
    sendVisit(tracker.payload());

    /* ── Secciones vistas ──────────────────────────────────────────────── */

    // 0.4 y no un píxel asomando: que un bloque cruce el borde de la pantalla
    // al hacer scroll rápido no es haberlo visto.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute(SECTION_ATTR);
          if (id) tracker.markSection(id as LandingSection);
          // Una sección vista ya no cambia de estado: dejamos de observarla.
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.4 },
    );

    for (const el of document.querySelectorAll(`[${SECTION_ATTR}]`)) {
      observer.observe(el);
    }

    /* ── Profundidad de scroll ─────────────────────────────────────────── */

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable <= 0) {
          tracker.markScroll(100);
          return;
        }
        tracker.markScroll((window.scrollY / scrollable) * 100);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Tiempo visible y envío ────────────────────────────────────────── */

    const flush = () => {
      tracker.stopVisible();
      sendVisit(tracker.payload());
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
      else tracker.startVisible();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      if (frame) window.cancelAnimationFrame(frame);
      // El usuario navega dentro de la SPA (login, signup): cerramos la visita
      // ahora, que es lo último que sabremos de ella.
      flush();
      trackerRef.current = null;
    };
  }, []);

  return {
    /** La conversión que importa: se apuntó a la lista de espera. */
    markWaitlist: () => {
      const tracker = trackerRef.current;
      if (!tracker) return;
      tracker.markWaitlist();
      sendVisit(tracker.payload());
    },
  };
}
