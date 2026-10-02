export type AirportMapInfo = {
  code: string;
  name: string;
  city: string;
  timeZone: string;
  officialUrl: string;
  officialMapUrl: string;
  embedUrl: string;
  mapLabel: string;
  summary: string;
};

type AirportRouteLeg = {
  departurePlace: string;
  arrivalPlace: string;
  departsAt: string;
};

const airportMaps: Record<string, AirportMapInfo> = {
  ILM: {
    code: 'ILM',
    name: 'Wilmington International Airport',
    city: 'Wilmington, North Carolina',
    timeZone: 'America/New_York',
    officialUrl: 'https://flyilm.com/',
    officialMapUrl: 'https://flyilm.com/',
    embedUrl:
      'https://www.openstreetmap.org/export/embed.html?bbox=-77.915%2C34.262%2C-77.895%2C34.278&layer=mapnik&marker=34.2706%2C-77.9026',
    mapLabel: 'Airport overview',
    summary: 'A compact home airport. Use the overview for the terminal approach, parking, and pickup area; confirm gate details in your airline pass.',
  },
  CLT: {
    code: 'CLT',
    name: 'Charlotte Douglas International Airport',
    city: 'Charlotte, North Carolina',
    timeZone: 'America/New_York',
    officialUrl: 'https://www.cltairport.com/',
    officialMapUrl: 'https://maps.cltairport.com/',
    embedUrl:
      'https://assets.ctfassets.net/jaw4bomip9l3/7qkHp4MneaKK3PzYPDffRt/eeb3df68b8c2b9c6e0602f9fc77654bb/Terminal_Map_-_Backlit_60x54_Sept_2026_-_WEB.pdf#view=FitH&toolbar=0&navpanes=0',
    mapLabel: 'Official terminal map',
    summary: 'Use CLT’s interactive map for concourses, gates, live shop and dining hours, and estimated walking time between two points.',
  },
  STL: {
    code: 'STL',
    name: 'St. Louis Lambert International Airport',
    city: 'St. Louis, Missouri',
    timeZone: 'America/Chicago',
    officialUrl: 'https://www.flystl.com/',
    officialMapUrl: 'https://www.flystl.com/terminal-maps/',
    embedUrl:
      'https://www.flystl.com/wp-content/uploads/2026/04/DT-906-STL-2026-map-T1-sg2.pdf#view=FitH&toolbar=0&navpanes=0',
    mapLabel: 'Official Terminal 1 map',
    summary: 'American uses Terminal 1 for this pilot route. The full official map page also includes Terminal 2, dining, lounges, and ground transportation.',
  },
  MCI: {
    code: 'MCI',
    name: 'Kansas City International Airport',
    city: 'Kansas City, Missouri',
    timeZone: 'America/Chicago',
    officialUrl: 'https://flykc.com/',
    officialMapUrl: 'https://flykc.com/terminal-maps/',
    embedUrl:
      'https://www.openstreetmap.org/export/embed.html?bbox=-94.726%2C39.291%2C-94.700%2C39.309&layer=mapnik&marker=39.2976%2C-94.7139',
    mapLabel: 'Airport overview',
    summary: 'Open the official terminal guide for gates, dining, services, and pickup details.',
  },
};

function normalizeAirportCode(value: string): string | null {
  const code = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : null;
}

export function getAirportMapInfo(code: string): AirportMapInfo {
  const normalized = normalizeAirportCode(code) ?? code.trim().toUpperCase();
  return (
    airportMaps[normalized] ?? {
      code: normalized,
      name: `${normalized} Airport`,
      city: 'Airport guide',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      officialUrl: `https://www.google.com/search?q=${encodeURIComponent(`${normalized} airport official site`)}`,
      officialMapUrl: `https://www.google.com/search?q=${encodeURIComponent(`${normalized} airport official terminal map`)}`,
      embedUrl: `https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(`${normalized} airport`)}`,
      mapLabel: 'Find the official terminal map',
      summary: 'This airport is new to Wanderly. Open the official-map search while its verified terminal guide is being added.',
    }
  );
}

export type ItineraryAirport = AirportMapInfo & {
  isLayover: boolean;
  routePosition: number;
};

export function getItineraryAirports(travel: AirportRouteLeg[]): ItineraryAirport[] {
  const sorted = [...travel].sort((a, b) => a.departsAt.localeCompare(b.departsAt));
  const route: string[] = [];
  const layovers: string[] = [];

  sorted.forEach((leg, index) => {
    const departure = normalizeAirportCode(leg.departurePlace);
    const arrival = normalizeAirportCode(leg.arrivalPlace);
    if (departure && !route.includes(departure)) route.push(departure);
    if (arrival && !route.includes(arrival)) route.push(arrival);

    const nextDeparture = normalizeAirportCode(sorted[index + 1]?.departurePlace ?? '');
    if (arrival && arrival === nextDeparture && !layovers.includes(arrival)) layovers.push(arrival);
  });

  return [...layovers, ...route.filter((code) => !layovers.includes(code))].map((code) => ({
    ...getAirportMapInfo(code),
    isLayover: layovers.includes(code),
    routePosition: route.indexOf(code),
  }));
}

