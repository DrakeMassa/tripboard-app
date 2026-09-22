import { describe, expect, it } from 'vitest';

import { normalizeExternalResourceUrl } from '@/domain/resources';

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
});
