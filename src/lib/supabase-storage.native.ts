import type { SupportedStorage } from '@supabase/auth-js';
import ExpoSQLiteStorage from 'expo-sqlite/kv-store';

// Metro selects this adapter for iOS and Android bundles only.
const storage: SupportedStorage = ExpoSQLiteStorage;
export default storage;
