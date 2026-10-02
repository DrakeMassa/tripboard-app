export const DEFAULT_POST_SIGN_IN_PATH = '/trips';

export function getSafeInternalPath(
  value: string | string[] | undefined,
  fallback = DEFAULT_POST_SIGN_IN_PATH,
): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) return fallback;
  return candidate;
}

export function buildWebAuthCallbackUrl(origin: string, nextPath?: string): string {
  const callback = new URL('/auth/callback', origin);
  callback.searchParams.set('next', getSafeInternalPath(nextPath));
  return callback.toString();
}
