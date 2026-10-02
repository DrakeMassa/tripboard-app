import { describe, expect, it } from 'vitest';

import { getItineraryAirports } from './airports';

describe('getItineraryAirports', () => {
  it('puts the connection first and keeps each airport once', () => {
    const airports = getItineraryAirports([
      { departurePlace: 'ILM', arrivalPlace: 'CLT', departsAt: '2026-10-07T18:40:00Z' },
      { departurePlace: 'CLT', arrivalPlace: 'STL', departsAt: '2026-10-07T22:17:00Z' },
    ]);

    expect(airports.map((airport) => airport.code)).toEqual(['CLT', 'ILM', 'STL']);
    expect(airports[0].isLayover).toBe(true);
  });

  it('ignores non-airport labels without dropping valid codes', () => {
    const airports = getItineraryAirports([
      { departurePlace: 'Hotel', arrivalPlace: 'STL', departsAt: '2026-10-08T10:00:00Z' },
    ]);

    expect(airports.map((airport) => airport.code)).toEqual(['STL']);
  });
});
