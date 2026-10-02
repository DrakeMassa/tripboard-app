import { describe, expect, it } from 'vitest';

import {
  isoToLocalDateTimeInput,
  localDateTimeToIso,
  normalizeDateOnly,
  optionalLocalDateTimeToIso,
  isoToZonedDateTimeInput,
  validateDateRange,
  zonedLocalDateTimeToIso,
} from '@/domain/trip-input';

describe('trip input validation', () => {
  it('accepts real date-only values and trims optional values', () => {
    expect(normalizeDateOnly(' 2026-10-07 ', 'start date')).toBe('2026-10-07');
    expect(normalizeDateOnly('', 'start date')).toBeNull();
  });

  it.each(['2026/10/07', '2026-02-30', 'not-a-date'])('rejects invalid date %s', (value) => {
    expect(() => normalizeDateOnly(value, 'start date')).toThrow('YYYY-MM-DD');
  });

  it('rejects a reversed trip date range', () => {
    expect(() => validateDateRange('2026-10-12', '2026-10-07')).toThrow();
    expect(() => validateDateRange('2026-10-07', '2026-10-12')).not.toThrow();
  });

  it('normalizes local date-time text to an ISO value', () => {
    const result = localDateTimeToIso('2026-10-07 14:40', 'departure');
    expect(new Date(result).getTime()).not.toBeNaN();
    expect(isoToLocalDateTimeInput(result)).toBe('2026-10-07 14:40');
  });

  it('allows an optional arrival or checkout time', () => {
    expect(optionalLocalDateTimeToIso('', 'arrival')).toBeNull();
  });

  it('keeps airport-local wall times stable across time zones', () => {
    const eastern = zonedLocalDateTimeToIso('2026-10-07 18:17', 'departure', 'America/New_York');
    const central = zonedLocalDateTimeToIso('2026-10-07 19:18', 'arrival', 'America/Chicago');

    expect(eastern).toBe('2026-10-07T22:17:00.000Z');
    expect(central).toBe('2026-10-08T00:18:00.000Z');
    expect(isoToZonedDateTimeInput(central, 'America/Chicago')).toBe('2026-10-07 19:18');
  });

  it.each(['2026-10-07', '2026-10-07 25:00', 'tomorrow at two'])(
    'rejects invalid local date-time %s',
    (value) => {
      expect(() => localDateTimeToIso(value, 'departure')).toThrow();
    },
  );
});
