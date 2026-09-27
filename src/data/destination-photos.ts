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
  editorialLabel?: string;
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

const columbiaEditorialSet: DestinationPhoto[] = [
  {
    id: 'columbia-faurot-tiger-stripe',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a6/2022_Faurot_Field_Tiger_Stripe.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:2022_Faurot_Field_Tiger_Stripe.jpg',
    description: 'A packed Faurot Field in the black-and-gold Tiger Stripe pattern',
    credit: 'Esb5415',
    license: 'CC BY 4.0',
    editorialLabel: 'GAME-DAY ENERGY',
  },
  {
    id: 'columbia-jesse-hall-pexels',
    imageUrl:
      'https://images.pexels.com/photos/12610210/pexels-photo-12610210.jpeg?auto=compress&cs=tinysrgb&w=2000',
    sourceUrl: 'https://www.pexels.com/photo/jesse-hall-university-of-missouri-12610210/',
    description: 'The Columns and Jesse Hall in warm afternoon light',
    credit: 'Chris Duan · Pexels',
    license: 'Pexels License',
    editorialLabel: 'ICONIC COLUMBIA',
  },
  {
    id: 'columbia-faurot-aerial',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Faurot_Field_Aerial.jpg/2560px-Faurot_Field_Aerial.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Faurot_Field_Aerial.jpg',
    description: 'An aerial view of Faurot Field and the Mizzou campus',
    credit: 'Lectrician2',
    license: 'CC BY-SA 4.0',
    editorialLabel: 'THE BIG PICTURE',
  },
  {
    id: 'columbia-rock-bridge',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Rock_Bridge_Memorial_State_Park_-_53100349739.jpg/2560px-Rock_Bridge_Memorial_State_Park_-_53100349739.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Rock_Bridge_Memorial_State_Park_-_53100349739.jpg',
    description: 'A green trail through Rock Bridge Memorial State Park',
    credit: 'Ben Nickelson · Missouri State Parks',
    license: 'Public Domain Mark',
    editorialLabel: 'BEYOND THE STADIUM',
  },
];

function getCuratedPhotos(location: string, tripTitle: string): DestinationPhoto[] | null {
  const normalizedLocation = location.trim().toLowerCase();
  if (/\bcolumbia\b/.test(normalizedLocation) && /\b(missouri|mo)\b/.test(normalizedLocation)) {
    const isSportsTrip = /\b(game|football|stadium|mizzou|tigers?)\b/i.test(tripTitle);
    if (isSportsTrip) return columbiaEditorialSet;
    return [
      columbiaEditorialSet[1],
      columbiaEditorialSet[3],
      columbiaEditorialSet[2],
      columbiaEditorialSet[0],
    ];
  }
  return null;
}

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
  const curated = getCuratedPhotos(location, tripTitle);
  if (curated) return curated;

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
