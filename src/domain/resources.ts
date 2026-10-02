export function normalizeExternalResourceUrl(value: string | null | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('Enter a complete https:// link.');
  }

  if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password) {
    throw new Error('Only secure https:// links without embedded credentials are supported.');
  }

  return parsed.toString();
}

export function inferResourceProvider(value: string | null | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;
  try {
    const host = new URL(candidate).hostname.toLowerCase().replace(/^www\./, '');
    if (host.endsWith('ticketmaster.com')) return 'Ticketmaster';
    if (host.endsWith('seatgeek.com')) return 'SeatGeek';
    if (host.endsWith('stubhub.com')) return 'StubHub';
    if (host.endsWith('axs.com')) return 'AXS';
    if (host.endsWith('icloud.com')) return 'Apple';
    if (host.endsWith('google.com') || host.endsWith('googleusercontent.com')) return 'Google';
    return null;
  } catch {
    return null;
  }
}
