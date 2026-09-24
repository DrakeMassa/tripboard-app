import { describe, expect, it } from 'vitest';

import {
  buildCommonsImageSearchUrl,
  getDestinationIntent,
  getDestinationPhotoQueries,
} from '@/domain/destination';

describe('destination image context', () => {
  it('uses the trip purpose instead of making every destination sports-first', () => {
    expect(getDestinationIntent('Columbia, Missouri', 'Columbia game weekend')).toBe('sports');
    expect(getDestinationIntent('Corona del Mar, California', 'Relaxing long weekend')).toBe('coast');
    expect(getDestinationIntent('Jackson, Wyoming', 'Tetons hiking trip')).toBe('outdoors');
    expect(getDestinationIntent('Chicago, Illinois', 'Anniversary weekend')).toBe('city');
  });

  it('builds a contextual query followed by broad destination fallbacks', () => {
    expect(getDestinationPhotoQueries('Columbia, Missouri', 'Game weekend')).toEqual([
      'Faurot Field Memorial Stadium Missouri football',
      'Columbia, Missouri landmark',
      'Columbia, Missouri travel landscape',
    ]);
  });

  it('builds a Wikimedia Commons query without leaking dates or traveler details', () => {
    const url = new URL(buildCommonsImageSearchUrl('Corona del Mar, California coast beach'));
    expect(url.hostname).toBe('commons.wikimedia.org');
    expect(url.searchParams.get('origin')).toBe('*');
    expect(url.searchParams.get('gsrsearch')).toContain('filetype:bitmap');
  });
});
