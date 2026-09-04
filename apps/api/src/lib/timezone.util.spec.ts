import {
  isValidTimeZone,
  zonedDayKey,
  zonedDayStart,
  zonedRange,
} from './timezone.util';

/**
 * These lock down the single definition of "a clinician's day".
 *
 * The dashboard once held three at the same time — the client's UTC date, the
 * server's local midnight, and a UTC bucket key — and reported three different
 * answers for the same afternoon.
 */
describe('timezone.util', () => {
  const MX = 'America/Mexico_City'; // UTC-6 (no DST since 2022)
  const MADRID = 'Europe/Madrid'; // UTC+2 in August

  describe('zonedDayStart', () => {
    it('reads the date as wall-clock in the zone, not as UTC', () => {
      // Midnight of Aug 9 in Mexico City is 06:00Z the same day.
      expect(zonedDayStart('2026-08-09', MX).toISOString()).toBe(
        '2026-08-09T06:00:00.000Z',
      );
      // Midnight of Aug 9 in Madrid is 22:00Z the PREVIOUS day.
      expect(zonedDayStart('2026-08-09', MADRID).toISOString()).toBe(
        '2026-08-08T22:00:00.000Z',
      );
    });

    it('UTC is the identity case', () => {
      expect(zonedDayStart('2026-08-09', 'UTC').toISOString()).toBe(
        '2026-08-09T00:00:00.000Z',
      );
    });
  });

  describe('zonedRange', () => {
    it('covers exactly one local day for a single date, half-open', () => {
      const { start, end } = zonedRange('2026-08-09', '2026-08-09', MX);
      expect(start.toISOString()).toBe('2026-08-09T06:00:00.000Z');
      expect(end.toISOString()).toBe('2026-08-10T06:00:00.000Z');
      // 24h exactly: no "+1 day buffer" leaking the next day in.
      expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
    });

    it('excludes the evening BEFORE the local day starts', () => {
      // 2026-08-08T21:01Z is 15:01 on Aug 8 in Mexico City — yesterday.
      // This exact instant used to be returned as part of "today".
      const { start } = zonedRange('2026-08-09', '2026-08-09', MX);
      expect(new Date('2026-08-08T21:01:00Z').getTime()).toBeLessThan(
        start.getTime(),
      );
    });

    it('includes a local-evening appointment that falls on the next UTC day', () => {
      // 2026-08-10T01:01Z is 19:01 on Aug 9 in Mexico City — still today.
      const { start, end } = zonedRange('2026-08-09', '2026-08-09', MX);
      const instant = new Date('2026-08-10T01:01:00Z').getTime();
      expect(instant).toBeGreaterThanOrEqual(start.getTime());
      expect(instant).toBeLessThan(end.getTime());
    });

    it('spans multi-day ranges inclusively', () => {
      const { start, end } = zonedRange('2026-08-01', '2026-08-31', MX);
      expect(start.toISOString()).toBe('2026-08-01T06:00:00.000Z');
      expect(end.toISOString()).toBe('2026-09-01T06:00:00.000Z');
    });
  });

  describe('zonedDayKey', () => {
    it('buckets by the clinician calendar day, not by UTC', () => {
      const eveningInMexico = new Date('2026-08-10T01:01:00Z');
      expect(zonedDayKey(eveningInMexico, MX)).toBe('2026-08-09');
      expect(zonedDayKey(eveningInMexico, 'UTC')).toBe('2026-08-10');
    });

    it('is stable across the UTC midnight boundary', () => {
      // Three appointments on the same local evening must share one bucket,
      // even though they straddle midnight UTC.
      const keys = [
        '2026-08-08T21:01:00Z',
        '2026-08-09T00:01:00Z',
        '2026-08-09T01:01:00Z',
      ].map((iso) => zonedDayKey(new Date(iso), MX));
      expect(new Set(keys).size).toBe(1);
      expect(keys[0]).toBe('2026-08-08');
    });
  });

  describe('isValidTimeZone', () => {
    it('accepts IANA zones and rejects junk', () => {
      expect(isValidTimeZone(MX)).toBe(true);
      expect(isValidTimeZone('UTC')).toBe(true);
      expect(isValidTimeZone('Not/AZone')).toBe(false);
    });
  });
});
