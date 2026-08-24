import type { SupportedStorage } from '@supabase/auth-js';

// Node, tests, and unknown platforms intentionally use in-memory auth state.
const storage: SupportedStorage | undefined = undefined;
export default storage;
