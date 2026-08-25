import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native-url-polyfill/auto', () => ({}));

vi.mock('react-native', () => ({
  AppState: { addEventListener: vi.fn() },
  NativeModules: {},
  Platform: { OS: 'ios' },
}));

describe('Supabase React Native initialization', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('gets a session without navigator.locks', async () => {
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    vi.stubGlobal('WebSocket', class WebSocket {});
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {},
    });

    const { requireSupabase } = await import('@/lib/supabase');
    await expect(requireSupabase().auth.getSession()).resolves.toMatchObject({
      data: { session: null },
      error: null,
    });
  });
});
