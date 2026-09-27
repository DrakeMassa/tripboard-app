import { describe, expect, it, vi } from 'vitest';

import { getDestinationPhotos } from '@/data/destination-photos';

describe('curated destination photos', () => {
  it('puts game-day imagery first for the Columbia sports pilot', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const photos = await getDestinationPhotos('Columbia, Missouri', 'Columbia game weekend');

    expect(photos).toHaveLength(4);
    expect(photos[0]).toMatchObject({
      id: 'columbia-faurot-tiger-stripe',
      editorialLabel: 'GAME-DAY ENERGY',
      license: 'CC BY 4.0',
    });
    expect(photos.every((photo) => photo.credit && photo.sourceUrl.startsWith('https://'))).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('recognizes the common Missouri abbreviation', async () => {
    const photos = await getDestinationPhotos('Columbia, MO', 'Weekend away');
    expect(photos[0].id).toBe('columbia-jesse-hall-pexels');
  });
});
