import { describe, expect, it } from 'vitest';

import { getDestinationGuide, guideSections } from '@/data/destination-guides';

describe('destination guides', () => {
  it('returns the curated Columbia guide', () => {
    const guide = getDestinationGuide('Columbia, Missouri');
    expect(guide?.destination).toBe('Columbia, Missouri');
    expect(guide?.recommendations.length).toBeGreaterThan(10);
  });

  it('covers every visible Columbia section', () => {
    const guide = getDestinationGuide('Columbia, MO');
    const usedSections = new Set(guide?.recommendations.map((item) => item.section));
    guideSections.forEach((section) => expect(usedSections.has(section.id)).toBe(true));
  });

  it('uses videos that can play inside the app', () => {
    const guide = getDestinationGuide('Columbia, Missouri');
    expect(guide?.videos.length).toBeGreaterThan(1);
    guide?.videos.forEach((video) => {
      expect(video.provider).toBe('youtube');
      expect(video.embedId).toBeTruthy();
      expect(video.url).toContain(video.embedId);
    });
  });

  it('shows only sourced ratings with a visible five-point scale', () => {
    const guide = getDestinationGuide('Columbia, Missouri');
    const rated = guide?.recommendations.filter((item) => item.rating) ?? [];

    expect(rated.length).toBeGreaterThanOrEqual(5);
    rated.forEach((item) => {
      expect(item.rating?.score).toBeGreaterThan(0);
      expect(item.rating?.score).toBeLessThanOrEqual(5);
      expect(item.rating?.checkedAt).toBeTruthy();
      expect(item.rating?.sourceUrl).toMatch(/^https:\/\//);
    });
  });

  it('does not invent a guide for an uncurated destination', () => {
    expect(getDestinationGuide('Somewhere new')).toBeNull();
  });
});
