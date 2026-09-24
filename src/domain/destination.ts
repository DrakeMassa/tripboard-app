export type DestinationIntent = 'sports' | 'coast' | 'outdoors' | 'city';

const sportsPattern = /\b(game|football|baseball|basketball|soccer|stadium|arena|race|golf)\b/i;
const coastPattern = /\b(beach|coast|coastal|ocean|sea|island|harbor|harbour|bay|corona del mar)\b/i;
const outdoorsPattern = /\b(hike|hiking|trail|mountain|mountains|summit|ski|snowboard|national park|tetons?)\b/i;

export function getDestinationIntent(location: string, tripTitle: string): DestinationIntent {
  const context = `${tripTitle} ${location}`;
  if (sportsPattern.test(context)) return 'sports';
  if (coastPattern.test(context)) return 'coast';
  if (outdoorsPattern.test(context)) return 'outdoors';
  return 'city';
}

export function getDestinationPhotoQueries(location: string, tripTitle: string): string[] {
  const destination = location.trim();
  if (!destination) return [];

  const intent = getDestinationIntent(destination, tripTitle);
  const normalizedDestination = destination.toLowerCase();
  let contextualQuery = {
    sports: `${destination} stadium sports`,
    coast: `${destination} coast beach`,
    outdoors: `${destination} mountain landscape`,
    city: `${destination} landmark cityscape`,
  }[intent];

  if (
    intent === 'sports' &&
    normalizedDestination.includes('columbia') &&
    normalizedDestination.includes('missouri')
  ) {
    contextualQuery = 'Faurot Field Memorial Stadium Missouri football';
  } else if (intent === 'coast' && normalizedDestination.includes('corona del mar')) {
    contextualQuery = 'Corona del Mar California coast';
  } else if (
    intent === 'outdoors' &&
    normalizedDestination.includes('jackson') &&
    normalizedDestination.includes('wyoming')
  ) {
    contextualQuery = 'Grand Teton Jackson Wyoming landscape';
  }

  return [
    contextualQuery,
    `${destination} landmark`,
    `${destination} travel landscape`,
  ];
}

export function buildCommonsImageSearchUrl(query: string): string {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    origin: '*',
    generator: 'search',
    gsrnamespace: '6',
    gsrlimit: '16',
    gsrsort: 'relevance',
    gsrsearch: `${query} filetype:bitmap`,
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1800',
    iiextmetadatalanguage: 'en',
    iiextmetadatafilter:
      'Artist|Credit|ImageDescription|LicenseShortName|LicenseUrl|ObjectName',
  });
  return `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
}
