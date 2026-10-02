export type ImportedTravelLeg = {
  kind: 'flight';
  provider: string;
  serviceNumber: string;
  departurePlace: string;
  arrivalPlace: string;
  departsAt: string;
  arrivesAt: string;
  departureTimeZone: string;
  arrivalTimeZone: string;
  notes: string;
};

const airlineNames: Record<string, string> = {
  AA: 'American Airlines',
  AS: 'Alaska Airlines',
  B6: 'JetBlue',
  DL: 'Delta Air Lines',
  F9: 'Frontier Airlines',
  NK: 'Spirit Airlines',
  UA: 'United Airlines',
  WN: 'Southwest Airlines',
};

const airlineTrackerCodes: Record<string, string> = {
  AA: 'AAL',
  AS: 'ASA',
  B6: 'JBU',
  DL: 'DAL',
  F9: 'FFT',
  NK: 'NKS',
  UA: 'UAL',
  WN: 'SWA',
};

const airportTimeZones: Record<string, string> = {
  CLT: 'America/New_York',
  ILM: 'America/New_York',
  STL: 'America/Chicago',
};

export const columbiaOutboundTemplate: ImportedTravelLeg[] = [
  {
    kind: 'flight',
    provider: 'American Airlines',
    serviceNumber: 'AA1531',
    departurePlace: 'ILM',
    arrivalPlace: 'CLT',
    departsAt: '2026-10-07T18:40:00.000Z',
    arrivesAt: '2026-10-07T19:53:00.000Z',
    departureTimeZone: 'America/New_York',
    arrivalTimeZone: 'America/New_York',
    notes: 'Columbia outbound · Economy · first leg',
  },
  {
    kind: 'flight',
    provider: 'American Airlines',
    serviceNumber: 'AA2686',
    departurePlace: 'CLT',
    arrivalPlace: 'STL',
    departsAt: '2026-10-07T22:17:00.000Z',
    arrivesAt: '2026-10-08T00:18:00.000Z',
    departureTimeZone: 'America/New_York',
    arrivalTimeZone: 'America/Chicago',
    notes: 'Columbia outbound · Economy · connection in Charlotte',
  },
];

export function airportTimeZone(airportCode: string): string {
  return airportTimeZones[airportCode.trim().toUpperCase()] ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function destinationTimeZone(location: string | null | undefined): string {
  const normalized = location?.trim().toLowerCase() ?? '';
  if (/\b(columbia|st\.? louis)\b/.test(normalized) && /\b(missouri|mo)\b/.test(normalized)) {
    return 'America/Chicago';
  }
  if (/\b(wilmington|charlotte)\b/.test(normalized) && /\b(north carolina|nc)\b/.test(normalized)) {
    return 'America/New_York';
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function zonedLocalToIso(date: string, time: string, timeZone: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);

  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(new Date(utcGuess));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
  );
  const offset = representedAsUtc - utcGuess;
  return new Date(utcGuess - offset).toISOString();
}

/**
 * Parses one flight per line in a compact, shareable format:
 * AA1531 ILM -> CLT 2026-10-07 14:40 -> 15:53
 */
export function parsePastedFlights(value: string): ImportedTravelLeg[] {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const legs = lines.map((line) => {
    const match = line.match(
      /^([A-Z0-9]{2})\s*([0-9]{1,4})\s+([A-Z]{3})\s*(?:→|->|TO)\s*([A-Z]{3})\s+(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s*(?:→|->|TO)\s*(\d{1,2}:\d{2})$/i,
    );
    if (!match) {
      throw new Error(`Could not read “${line}”. Use the example format shown below the field.`);
    }

    const [, rawAirline, flightNumber, rawDeparture, rawArrival, departureDate, departureTime, arrivalTime] = match;
    const airline = rawAirline.toUpperCase();
    const departurePlace = rawDeparture.toUpperCase();
    const arrivalPlace = rawArrival.toUpperCase();
    const departureTimeZone = airportTimeZone(departurePlace);
    const arrivalTimeZone = airportTimeZone(arrivalPlace);
    const departsAt = zonedLocalToIso(departureDate, departureTime, departureTimeZone);
    let arrivalDate = departureDate;
    let arrivesAt = zonedLocalToIso(arrivalDate, arrivalTime, arrivalTimeZone);
    if (Date.parse(arrivesAt) <= Date.parse(departsAt)) {
      arrivalDate = addDays(departureDate, 1);
      arrivesAt = zonedLocalToIso(arrivalDate, arrivalTime, arrivalTimeZone);
    }

    return {
      kind: 'flight' as const,
      provider: airlineNames[airline] ?? airline,
      serviceNumber: `${airline}${flightNumber}`,
      departurePlace,
      arrivalPlace,
      departsAt,
      arrivesAt,
      departureTimeZone,
      arrivalTimeZone,
      notes: 'Imported from pasted itinerary',
    };
  });

  if (!legs.length) throw new Error('Paste at least one flight before importing.');
  return legs;
}

export function formatAirportMoment(
  value: string | null,
  airportCode: string,
  explicitTimeZone?: string | null,
): string {
  if (!value) return 'Time to be added';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    timeZone: explicitTimeZone || airportTimeZone(airportCode),
    timeZoneName: 'short',
  }).format(new Date(value));
}

export function getLayoverMinutes(
  current: { arrivalPlace: string; arrivesAt: string | null },
  next: { departurePlace: string; departsAt: string } | undefined,
): number | null {
  if (!next || !current.arrivesAt) return null;
  if (current.arrivalPlace.trim().toUpperCase() !== next.departurePlace.trim().toUpperCase()) return null;
  const minutes = Math.round((Date.parse(next.departsAt) - Date.parse(current.arrivesAt)) / 60_000);
  return minutes >= 0 && minutes <= 24 * 60 ? minutes : null;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder}m`;
  return `${hours}h ${remainder.toString().padStart(2, '0')}m`;
}

export function flightTrackerUrl(serviceNumber: string | null): string | null {
  const normalized = serviceNumber?.replace(/\s+/g, '').toUpperCase() ?? '';
  const match = normalized.match(/^([A-Z0-9]{2})(\d{1,4})$/);
  if (!match) return null;
  const [, airline, flightNumber] = match;
  const trackerCode = airlineTrackerCodes[airline];
  if (trackerCode) return `https://www.flightaware.com/live/flight/${trackerCode}${flightNumber}`;
  return `https://www.google.com/search?q=${encodeURIComponent(`${normalized} flight status`)}`;
}
