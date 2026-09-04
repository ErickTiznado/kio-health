import { useEffect, useState } from 'react';

/**
 * Devuelve si la interfaz está en oscuro ahora mismo.
 *
 * Lee la clase real del `<html>` en vez del valor guardado del store porque
 * el tema `system` no dice por sí solo qué está pintado en pantalla; quien
 * resuelve eso es `theme.store`, y lo deja escrito en el DOM.
 *
 * Existe para elegir la variante de las capturas de la landing: son imágenes,
 * así que no pueden cambiar de tema con una clase `dark:`.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains('dark'));

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    // El tema `system` sigue a la preferencia del sistema operativo, que puede
    // cambiar sin que nadie toque la aplicación.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', sync);

    sync();
    return () => {
      observer.disconnect();
      media.removeEventListener('change', sync);
    };
  }, []);

  return isDark;
}
