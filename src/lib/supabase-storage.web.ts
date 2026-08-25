import type { SupportedStorage } from '@supabase/auth-js';

// Guard browser globals so SSR and static-export evaluation stay safe.
const storage: SupportedStorage | undefined =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : undefined;

export default storage;
