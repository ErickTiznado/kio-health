import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SECTION_ATTR,
  useLandingAnalytics,
} from '../use-landing-analytics';

/**
 * El observador de secciones y el máximo de scroll dependen de un viewport con
 * altura real, así que no se pueden comprobar en un navegador headless con la
 * ventana oculta (`innerHeight` vale 0 y nada intersecta nunca). Aquí se
 * verifican contra un `IntersectionObserver` falso y un scroll simulado, que es
 * donde el comportamiento es determinista.
 */

type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;

let lastCallback: ObserverCallback | null = null;
let observed: Element[] = [];
let beacons: Array<Record<string, unknown>> = [];

beforeEach(() => {
  lastCallback = null;
  observed = [];
  beacons = [];

  // jsdom no implementa matchMedia.
  vi.stubGlobal('matchMedia', () => ({ matches: false }));

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: ObserverCallback) {
        lastCallback = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {}
    },
  );

  // sendBeacon no existe en jsdom; lo interceptamos para leer el payload.
  Object.defineProperty(navigator, 'sendBeacon', {
    configurable: true,
    writable: true,
    value: (_url: string, blob: Blob) => {
      // El Blob de jsdom no expone `text()` de forma síncrona, así que
      // reconstruimos desde lo que ya conocemos del cuerpo.
      void blob;
      return true;
    },
  });

  vi.stubGlobal(
    'fetch',
    vi.fn((_url: string, init?: RequestInit) => {
      beacons.push(JSON.parse(String(init?.body)));
      return Promise.resolve(new Response(null, { status: 204 }));
    }),
  );
  // Forzamos la vía fetch para poder leer el cuerpo.
  (navigator as unknown as { sendBeacon?: unknown }).sendBeacon = undefined;

  document.body.innerHTML = `
    <div ${SECTION_ATTR}="hero"></div>
    <div ${SECTION_ATTR}="dashboard"></div>
  `;
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useLandingAnalytics', () => {
  it('observa todas las secciones marcadas y registra las que se ven', () => {
    const { unmount } = renderHook(() => useLandingAnalytics());

    expect(observed).toHaveLength(2);

    act(() => {
      lastCallback?.([
        { isIntersecting: true, target: observed[1] },
        { isIntersecting: false, target: observed[0] },
      ]);
    });

    unmount(); // el desmontaje cierra la visita y manda el resumen

    const last = beacons.at(-1)!;
    // Solo la que llegó a intersectar: cruzar el borde no cuenta como verla.
    expect(last.sectionsSeen).toEqual(['dashboard']);
  });

  it('manda el resumen al entrar, para no perder a quien rebota', () => {
    const { unmount } = renderHook(() => useLandingAnalytics());
    expect(beacons.length).toBeGreaterThanOrEqual(1);
    expect(beacons[0].source).toBe('directo');
    unmount();
  });

  it('markWaitlist marca la conversión y la manda enseguida', () => {
    const { result, unmount } = renderHook(() => useLandingAnalytics());

    act(() => result.current.markWaitlist());

    expect(beacons.at(-1)!.waitlist).toBe(true);
    unmount();
  });
});
