import { getAccessToken } from './tokenStore';
import { refreshFor } from './refreshCoordinator';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function doFetch(path, { method, body, headers, auth, role }) {
  const finalHeaders = { ...headers };
  // FormData (file uploads) must keep its own multipart Content-Type with
  // boundary, set automatically by the browser — never JSON.stringify it or
  // override the header ourselves.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) finalHeaders['Content-Type'] = 'application/json';
  if (auth) {
    const token = getAccessToken(role);
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  return { res, data };
}

/**
 * Thin fetch wrapper: JSON in/out, credentials included for the httpOnly
 * refresh cookie, and the in-memory access token attached unless the caller
 * opts out (public endpoints like login/signup/refresh).
 *
 * `role` says which role's access token/refresh handler this call belongs
 * to (student/organizer/admin can all have a live session in the same
 * browser at once — see tokenStore.js — so there's no single "current
 * role" to infer this from). Required whenever `auth` is true; public
 * calls (auth: false) don't need it.
 *
 * A 401 on an authenticated call is treated as "the access token probably
 * just expired" (they last 15 minutes and nothing else renews them): it
 * transparently refreshes via that role's registered handler (see
 * refreshCoordinator.js) and retries the request exactly once. If the
 * refresh itself fails, the original 401 is what the caller sees — a real
 * auth failure, not a network hiccup.
 */
export async function apiFetch(
  path,
  { method = 'GET', body, headers = {}, auth = true, role = null, _retried = false } = {}
) {
  const { res, data } = await doFetch(path, { method, body, headers, auth, role });

  if (!res.ok) {
    if (res.status === 401 && auth && role && !_retried) {
      const refreshing = refreshFor(role);
      if (refreshing) {
        try {
          await refreshing;
          return apiFetch(path, { method, body, headers, auth, role, _retried: true });
        } catch {
          // Refresh failed too — fall through and surface the original 401.
        }
      }
    }
    throw new ApiError(data?.message || `Request failed with status ${res.status}`, res.status, data);
  }

  return data;
}
