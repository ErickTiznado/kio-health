import { describe, it, expect } from 'vitest';
import { sanitizePath } from '../analytics';
import { toLengthBucket } from '../analytics.events';

/**
 * `sanitizePath` es la única barrera entre las rutas de Kio y un tercero.
 * Las rutas llevan UUID de paciente y de cita, y tokens de portal y de reseteo.
 * Si esta función se relaja, se filtra PII clínica sin que nadie se entere:
 * por eso cada forma de identificador que existe en `App.tsx` tiene su caso.
 */
describe('sanitizePath', () => {
  it('reemplaza el UUID de un paciente', () => {
    expect(sanitizePath('/patients/3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toBe('/patients/:id');
  });

  it('reemplaza el UUID de una cita en la ruta de sesión', () => {
    expect(sanitizePath('/session/3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toBe('/session/:id');
  });

  it('reemplaza el token de invitación a clínica', () => {
    expect(sanitizePath('/join/aVeryLongOpaqueInviteToken123')).toBe('/join/:id');
  });

  it('reemplaza el token del portal del paciente', () => {
    expect(sanitizePath('/p/aVeryLongOpaquePortalToken456')).toBe('/p/:id');
  });

  it('descarta la query entera — ahí viaja el token de reseteo', () => {
    expect(sanitizePath('/reset-password?token=secreto-de-reseteo')).toBe('/reset-password');
  });

  it('descarta el hash', () => {
    expect(sanitizePath('/dashboard#seccion')).toBe('/dashboard');
  });

  it('sanea también una URL absoluta', () => {
    expect(sanitizePath('https://app.kio.health/patients/3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toBe(
      '/patients/:id',
    );
  });

  it('deja intactas las rutas sin identificador', () => {
    expect(sanitizePath('/dashboard')).toBe('/dashboard');
    expect(sanitizePath('/agenda')).toBe('/agenda');
    expect(sanitizePath('/access-logs')).toBe('/access-logs');
    expect(sanitizePath('/change-password')).toBe('/change-password');
  });

  it('conserva la raíz', () => {
    expect(sanitizePath('/')).toBe('/');
  });

  it('reemplaza segmentos numéricos', () => {
    expect(sanitizePath('/finance/2026')).toBe('/finance/:id');
  });

  it('no revienta con una entrada que no es una ruta', () => {
    expect(sanitizePath('http://[::1]:no-es-una-url')).toBe('/desconocida');
  });
});

describe('toLengthBucket', () => {
  it('agrupa en tramos y nunca devuelve la longitud exacta', () => {
    expect(toLengthBucket(0)).toBe('0');
    expect(toLengthBucket(1)).toBe('1-200');
    expect(toLengthBucket(200)).toBe('1-200');
    expect(toLengthBucket(201)).toBe('201-1000');
    expect(toLengthBucket(1000)).toBe('201-1000');
    expect(toLengthBucket(1001)).toBe('1001-3000');
    expect(toLengthBucket(9000)).toBe('3000+');
  });
});
