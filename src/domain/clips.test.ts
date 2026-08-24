import { describe, expect, it } from 'vitest';

import { classifyClipSource } from './clips';

describe('classifyClipSource', () => {
  it('recognizes supported social links', () => {
    expect(classifyClipSource('https://www.tiktok.com/@rome/video/123')).toBe('tiktok');
    expect(classifyClipSource('https://www.instagram.com/reel/example')).toBe('instagram');
    expect(classifyClipSource('https://youtu.be/example')).toBe('youtube');
  });

  it('treats other links as web inspiration', () => {
    expect(classifyClipSource('https://example.com/rome-guide')).toBe('web');
  });
});
