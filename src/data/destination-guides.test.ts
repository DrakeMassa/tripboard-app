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

  it('does not invent a guide for an uncurated destination', () => {
    expect(getDestinationGuide('Somewhere new')).toBeNull();
  });
});
