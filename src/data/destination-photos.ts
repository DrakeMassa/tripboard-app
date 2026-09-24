import {
  buildCommonsImageSearchUrl,
  getDestinationPhotoQueries,
} from '@/domain/destination';

export type DestinationPhoto = {
  id: string;
  imageUrl: string;
  sourceUrl: string;
  description: string;
  credit: string;
  license: string;
};

type MetadataValue = { value?: string };

type CommonsPage = {
  pageid?: number;
  title?: string;
  imageinfo?: {
    width?: number;
    height?: number;
    mime?: string;
    thumburl?: string;
    url?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, MetadataValue>;
  }[];
};

type CommonsResponse = {
  query?: { pages?: CommonsPage[] };
};

const photoCache = new Map<string, Promise<DestinationPhoto[]>>();

function stripMarkup(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function pageToPhoto(page: CommonsPage): DestinationPhoto | null {
  const info = page.imageinfo?.[0];
  if (!info) return null;
  const width = info.width ?? 0;
  const height = info.height ?? 0;
  const imageUrl = info.thumburl ?? info.url;
  if (
    !imageUrl?.startsWith('https://') ||
    !info.descriptionurl?.startsWith('https://') ||
    !info.mime?.startsWith('image/') ||
    width < 1200 ||
    height < 600 ||
    width / height < 1.3
  ) {
    return null;
  }

  const metadata = info.extmetadata ?? {};
  const fallbackTitle = (page.title ?? 'Destination photo').replace(/^File:/, '').replace(/\.[^.]+$/, '');
  return {
    id: String(page.pageid ?? imageUrl),
    imageUrl,
    sourceUrl: info.descriptionurl,
    description:
      stripMarkup(metadata.ObjectName?.value) ||
      stripMarkup(metadata.ImageDescription?.value) ||
      fallbackTitle,
    credit:
      stripMarkup(metadata.Credit?.value) || stripMarkup(metadata.Artist?.value) || 'Wikimedia Commons contributor',
    license: stripMarkup(metadata.LicenseShortName?.value) || 'Wikimedia Commons',
  };
}

async function searchCommons(query: string): Promise<DestinationPhoto[]> {
  const response = await fetch(buildCommonsImageSearchUrl(query), {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Destination photos are temporarily unavailable.');
  const payload = (await response.json()) as CommonsResponse;
  return (payload.query?.pages ?? [])
    .map(pageToPhoto)
    .filter((photo): photo is DestinationPhoto => Boolean(photo));
}

async function loadDestinationPhotos(location: string, tripTitle: string): Promise<DestinationPhoto[]> {
  const unique = new Map<string, DestinationPhoto>();
  for (const query of getDestinationPhotoQueries(location, tripTitle)) {
    try {
      const results = await searchCommons(query);
      results.forEach((photo) => unique.set(photo.imageUrl, photo));
      if (unique.size >= 5) break;
    } catch {
      // A green branded fallback remains visible if the public photo service is unavailable.
    }
  }
  return [...unique.values()].slice(0, 5);
}

export function getDestinationPhotos(location: string, tripTitle: string): Promise<DestinationPhoto[]> {
  const cacheKey = `${location.trim().toLowerCase()}|${tripTitle.trim().toLowerCase()}`;
  const cached = photoCache.get(cacheKey);
  if (cached) return cached;
  const request = loadDestinationPhotos(location, tripTitle);
  photoCache.set(cacheKey, request);
  return request;
}
