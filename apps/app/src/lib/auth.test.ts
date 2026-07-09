import { afterEach, describe, expect, it } from 'vitest';

import {
  AUTH_COOKIE,
  AUTH_USER_KEY,
  clearAuthCookie,
  clearAuthSession,
  persistAuthSession,
  setAuthCookie,
} from './auth';

describe('auth helpers', () => {
  afterEach(() => {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
    sessionStorage.clear();
  });

  it('sets the auth cookie', () => {
    setAuthCookie('token-123');
    expect(document.cookie).toContain(`${AUTH_COOKIE}=token-123`);
  });

  it('clears the auth cookie', () => {
    setAuthCookie('token-123');
    clearAuthCookie();
    expect(document.cookie).not.toContain('token-123');
  });

  it('persists and clears the auth session', () => {
    persistAuthSession('token-123', { id: 'user-1', email: 'user@example.com' });

    expect(sessionStorage.getItem('access_token')).toBe('token-123');
    expect(sessionStorage.getItem(AUTH_USER_KEY)).toContain('user@example.com');
    expect(document.cookie).toContain(`${AUTH_COOKIE}=token-123`);

    clearAuthSession();

    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(sessionStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(document.cookie).not.toContain('token-123');
  });
});
