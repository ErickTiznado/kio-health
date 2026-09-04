/**
 * Timezone-aware calendar-day helpers.
 *
 * The dashboard used to disagree with itself about what "today" was, three
 * different ways at once:
 *
 *  - the client derived the date from `toISOString()` (UTC),
 *  - `findByDate` did `new Date('2026-08-09')` — parsed as UTC midnight — and
 *    then applied `setHours(0,0,0,0)` in the SERVER's timezone, plus a
 *    "+1 day buffer", producing a two-day window starting a day early,
 *  - `getDaySummary` bucketed appointments by `toISOString().split('T')[0]`,
 *    i.e. by UTC day.
 *
 * A clinician's day is neither the server's nor UTC's. Every range and every
 * bucket below is computed in an explicit IANA timezone supplied by the caller.
 */

/** Milliseconds to add to a UTC instant to get the wall-clock time in `tz`. */
function offsetMs(instant: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(instant)) parts[p.type] = p.value;

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - instant.getTime();
}

/** True when `tz` is a timezone this runtime understands. */
export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * The UTC instant at which the given calendar date starts in `tz`.
 * `dateString` is `YYYY-MM-DD` and is read as a wall-clock date, never as UTC.
 */
export function zonedDayStart(dateString: string, tz: string): Date {
  const [y, m, d] = dateString.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  // One correction pass is exact except within a DST transition hour, where the
  // result still lands inside the intended day.
  return new Date(guess - offsetMs(new Date(guess), tz));
}

/**
 * Half-open range `[start, end)` covering the local days `from`..`to` inclusive
 * in `tz`. Half-open avoids both the millisecond gap of `23:59:59.999` and the
 * day-wide "buffer" that used to leak the following day into the result.
 */
export function zonedRange(
  from: string,
  to: string,
  tz: string,
): { start: Date; end: Date } {
  const start = zonedDayStart(from, tz);
  const [y, m, d] = to.split('-').map(Number);
  const dayAfterTo = new Date(Date.UTC(y, m - 1, d));
  dayAfterTo.setUTCDate(dayAfterTo.getUTCDate() + 1);
  const end = zonedDayStart(dayAfterTo.toISOString().slice(0, 10), tz);
  return { start, end };
}

/** The `YYYY-MM-DD` calendar day an instant falls on, as seen from `tz`. */
export function zonedDayKey(instant: Date, tz: string): string {
  // 'en-CA' formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}
