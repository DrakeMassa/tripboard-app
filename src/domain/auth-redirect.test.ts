import { describe, expect, it } from 'vitest';

import {
  buildWebAuthCallbackUrl,
  DEFAULT_POST_SIGN_IN_PATH,
  getSafeInternalPath,
} from '@/domain/auth-redirect';

describe('auth redirects', () => {
  it('keeps safe internal destinations', () => {
    expect(getSafeInternalPath('/trips/abc?tab=plan')).toBe('/trips/abc?tab=plan');
    expect(getSafeInternalPath(['/invite/token', '/ignored'])).toBe('/invite/token');
  });

  it('rejects missing and protocol-relative destinations', () => {
    expect(getSafeInternalPath(undefined)).toBe(DEFAULT_POST_SIGN_IN_PATH);
    expect(getSafeInternalPath('https://attacker.example')).toBe(DEFAULT_POST_SIGN_IN_PATH);
    expect(getSafeInternalPath('//attacker.example')).toBe(DEFAULT_POST_SIGN_IN_PATH);
  });

  it('builds an origin-specific callback URL', () => {
    expect(buildWebAuthCallbackUrl('https://wanderly.example', '/trips/abc')).toBe(
      'https://wanderly.example/auth/callback?next=%2Ftrips%2Fabc',
    );
  });
});
