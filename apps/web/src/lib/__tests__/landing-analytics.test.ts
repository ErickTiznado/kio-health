import { describe, expect, it } from 'vitest';
import { detectSource, LandingVisitTracker } from '../landing-analytics';

const OWN = 'kiohealth.app';
const IG_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Instagram 340.0.0.19.109';
const PLAIN_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36';

describe('detectSource', () => {
  it('el utm manda por encima de todo lo demás', () => {
    const origin = detectSource(
      '?utm_source=instagram&utm_campaign=bio',
      'https://www.google.com/',
      PLAIN_UA,
      OWN,
    );
    expect(origin.source).toBe('instagram');
  });

  it('acepta ?ref= como atajo del enlace de la bio', () => {
    expect(detectSource('?ref=IG', '', PLAIN_UA, OWN).source).toBe('ig');
  });

  it('reconoce hosts conocidos por el referrer', () => {
    const origin = detectSource('', 'https://l.instagram.com/x', PLAIN_UA, OWN);
    expect(origin.source).toBe('instagram');
    expect(origin.referrerHost).toBe('l.instagram.com');
  });

  it('guarda el host tal cual cuando no lo conoce', () => {
    expect(detectSource('', 'https://foro.psi.es/hilo', PLAIN_UA, OWN).source).toBe(
      'foro.psi.es',
    );
  });

  it('una navegación interna no cuenta como fuente externa', () => {
    expect(detectSource('', `https://${OWN}/login`, PLAIN_UA, OWN).source).toBe(
      'directo',
    );
  });

  // Este es el caso que justifica toda la detección de navegador embebido: el
  // in-app de Instagram no manda referrer, y sin esto sería tráfico "directo".
  it('sin referrer ni utm, el navegador de Instagram se atribuye a Instagram', () => {
    const origin = detectSource('', '', IG_UA, OWN);
    expect(origin.source).toBe('instagram');
    expect(origin.inAppBrowser).toBe(true);
  });

  it('sin ninguna señal, es tráfico directo', () => {
    const origin = detectSource('', '', PLAIN_UA, OWN);
    expect(origin).toEqual({
      source: 'directo',
      referrerHost: undefined,
      inAppBrowser: false,
    });
  });
});

describe('LandingVisitTracker', () => {
  const build = (clock: { t: number }) =>
    new LandingVisitTracker(
      'a3b1e1d2-0000-4000-8000-000000000000',
      { source: 'instagram', inAppBrowser: true },
      { utmSource: 'instagram' },
      'movil',
      () => clock.t,
    );

  it('solo cuenta el tiempo con la pestaña visible', () => {
    const clock = { t: 0 };
    const tracker = build(clock);

    tracker.startVisible();
    clock.t = 4000;
    tracker.stopVisible(); // el usuario se va a otra app

    clock.t = 60_000; // un minuto fuera, que no es lectura
    tracker.startVisible();
    clock.t = 63_000;

    expect(tracker.dwellMs()).toBe(7000);
  });

  it('el scroll guarda el máximo, no el último valor', () => {
    const tracker = build({ t: 0 });
    tracker.markScroll(80);
    tracker.markScroll(20); // volvió arriba
    expect(tracker.payload().maxScrollPct).toBe(80);
  });

  it('las secciones no se repiten', () => {
    const tracker = build({ t: 0 });
    tracker.markSection('hero');
    tracker.markSection('hero');
    tracker.markSection('dashboard');
    expect(tracker.payload().sectionsSeen).toEqual(['hero', 'dashboard']);
  });
});
