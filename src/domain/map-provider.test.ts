import { describe, expect, it } from 'vitest';

import { googleMapsApiEnabled, resolveMapProvider } from '@/domain/map-provider';

describe('map provider cost guardrail', () => {
  it('defaults to the keyless OpenStreetMap path', () => {
    expect(resolveMapProvider(undefined)).toBe('openstreetmap');
    expect(resolveMapProvider('anything-else')).toBe('openstreetmap');
  });

  it('does not activate Google from a stored key alone', () => {
    expect(googleMapsApiEnabled(undefined, 'stored-browser-key')).toBe(false);
    expect(googleMapsApiEnabled('openstreetmap', 'stored-browser-key')).toBe(false);
  });

  it('requires both an explicit Google selection and a key', () => {
    expect(googleMapsApiEnabled('google', undefined)).toBe(false);
    expect(googleMapsApiEnabled(' Google ', ' restricted-browser-key ')).toBe(true);
  });
});

