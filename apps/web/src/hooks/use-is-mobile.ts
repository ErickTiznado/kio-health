import { useSyncExternalStore } from 'react';

/** Mismo umbral que el breakpoint `md` de Tailwind. */
const MOBILE_QUERY = '(max-width: 767px)';

function subscribe(onStoreChange: () => void): () => void {
    if (typeof window === 'undefined') return () => { };

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    mediaQuery.addEventListener('change', onStoreChange);
    return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getSnapshot(): boolean {
    return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

/**
 * `true` en anchos de móvil.
 *
 * Se lee del propio `matchMedia` en cada render en vez de arrancar siempre en
 * `false` y corregirse después: ese primer fotograma equivocado hacía que la
 * agenda pintara la vista semanal en el móvil antes de saltar a la de día.
 */
export function useIsMobile(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
