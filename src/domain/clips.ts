export type ClipSource = 'tiktok' | 'instagram' | 'youtube' | 'web';

export function classifyClipSource(rawUrl: string): ClipSource {
  const hostname = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');

  if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) return 'tiktok';
  if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) return 'instagram';
  if (
    hostname === 'youtube.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtu.be'
  ) {
    return 'youtube';
  }

  return 'web';
}
