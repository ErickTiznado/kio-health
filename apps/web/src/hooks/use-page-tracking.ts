import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { capturePageview } from '../lib/analytics';

/**
 * Un `$pageview` por navegación, con la ruta ya saneada.
 *
 * PostHog trae captura automática de pageviews y está apagada a propósito
 * (`capture_pageview: false`): mandaría la URL cruda, y en Kio la URL cruda
 * lleva el UUID del paciente o el token del portal. Este hook es el único
 * emisor, y pasa siempre por `sanitizePath`.
 *
 * Depende de `location.pathname`, no del objeto `location`: un cambio de query
 * o de hash no es una vista nueva, y la query ni siquiera se manda.
 */
export function usePageTracking(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    capturePageview(pathname);
  }, [pathname]);
}
