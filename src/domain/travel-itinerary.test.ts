import { describe, expect, it } from 'vitest';

import {
  columbiaOutboundTemplate,
  flightTrackerUrl,
  formatDuration,
  getLayoverMinutes,
  parsePastedFlights,
} from '@/domain/travel-itinerary';

describe('travel itinerary helpers', () => {
  it('ships the two confirmed Columbia outbound legs with the connection intact', () => {
    expect(columbiaOutboundTemplate.map((leg) => leg.serviceNumber)).toEqual(['AA1531', 'AA2686']);
    expect(getLayoverMinutes(columbiaOutboundTemplate[0], columbiaOutboundTemplate[1])).toBe(144);
    expect(formatDuration(144)).toBe('2h 24m');
  });

  it('parses multiple compact flight lines in each airport local time', () => {
    const legs = parsePastedFlights(
      'AA1531 ILM -> CLT 2026-10-07 14:40 -> 15:53\nAA2686 CLT -> STL 2026-10-07 18:17 -> 19:18',
    );

    expect(legs).toHaveLength(2);
    expect(legs[0]).toMatchObject({ departurePlace: 'ILM', arrivalPlace: 'CLT' });
    expect(legs[1].arrivesAt).toBe('2026-10-08T00:18:00.000Z');
  });

  it('builds a live tracker link for supported airline numbers', () => {
    expect(flightTrackerUrl('AA 1531')).toBe('https://www.flightaware.com/live/flight/AAL1531');
    expect(flightTrackerUrl(null)).toBeNull();
  });

  it('rejects vague text instead of inventing flight details', () => {
    expect(() => parsePastedFlights('American flight to St Louis')).toThrow(/Could not read/);
  });
});
