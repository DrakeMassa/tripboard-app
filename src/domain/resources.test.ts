import { describe, expect, it } from 'vitest';

import { inferResourceProvider, normalizeExternalResourceUrl } from '@/domain/resources';

describe('normalizeExternalResourceUrl', () => {
  it('normalizes secure ticket and shared-album links', () => {
    expect(normalizeExternalResourceUrl(' https://tickets.example/game?id=42 ')).toBe(
      'https://tickets.example/game?id=42',
    );
    expect(normalizeExternalResourceUrl('https://www.icloud.com/sharedalbum/#Trip')).toBe(
      'https://www.icloud.com/sharedalbum/#Trip',
    );
  });

  it('allows a resource with details but no link', () => {
    expect(normalizeExternalResourceUrl('')).toBeNull();
    expect(normalizeExternalResourceUrl(null)).toBeNull();
  });

  it.each([
    'javascript:alert(1)',
    'http://tickets.example/game',
    'https://user:password@tickets.example/game',
    'not a url',
  ])('rejects unsafe resource link %s', (value) => {
    expect(() => normalizeExternalResourceUrl(value)).toThrow();
  });

  it('recognizes common ticket and album providers from secure links', () => {
    expect(inferResourceProvider('https://www.ticketmaster.com/event/123')).toBe('Ticketmaster');
    expect(inferResourceProvider('https://photos.google.com/share/abc')).toBe('Google');
    expect(inferResourceProvider('not-yet-a-url')).toBeNull();
  });
});
