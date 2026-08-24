import type { SupportedStorage } from '@supabase/auth-js';

// Do not access browser globals until after verifying they exist. This keeps SSR
// and static export evaluation safe while still persisting browser sessions.
const webStorage: SupportedStorage | undefined =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : undefined;

export default webStorage;
