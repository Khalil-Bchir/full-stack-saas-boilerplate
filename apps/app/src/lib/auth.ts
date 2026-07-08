export const AUTH_COOKIE = 'access_token';
export const AUTH_USER_KEY = 'user';

export function setAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 24) {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function persistAuthSession(token: string, user: unknown) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('access_token', token);
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  setAuthCookie(token);
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem(AUTH_USER_KEY);
  clearAuthCookie();
}
