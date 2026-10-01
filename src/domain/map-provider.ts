export type MapProvider = 'openstreetmap' | 'google';

export function resolveMapProvider(value: string | null | undefined): MapProvider {
  return value?.trim().toLowerCase() === 'google' ? 'google' : 'openstreetmap';
}

export function googleMapsApiEnabled(
  provider: string | null | undefined,
  apiKey: string | null | undefined,
): boolean {
  return resolveMapProvider(provider) === 'google' && Boolean(apiKey?.trim());
}

