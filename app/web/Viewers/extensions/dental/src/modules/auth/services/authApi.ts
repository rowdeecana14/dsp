import {
  getApiBase,
  handleDentalUnauthorized,
  setDentalUnauthorizedHandler,
  type DentalFetchOptions,
} from '../../../shared/services/api';

const TOKEN_KEY = 'dental_auth_token';
const USER_KEY = 'dental_auth_user';

export interface DentalAuthUser {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): DentalAuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as DentalAuthUser;
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: DentalAuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function signOutAndRedirect(): void {
  clearAuth();
  window.location.href = '/login';
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: DentalAuthUser }> {
  const res = await fetch(`${getApiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message ?? 'Login failed');
  }

  const { token, user } = json.data as { token: string; user: DentalAuthUser };
  if (!token) {
    throw new Error('No token returned from server');
  }

  storeAuth(token, user);
  return { token, user };
}

type UserAuthenticationService = {
  reset: () => void;
  set: (state: { enabled?: boolean; user?: DentalAuthUser | null }) => void;
};

function applyDentalAuthServiceImplementation(
  userAuthenticationService: UserAuthenticationService
): void {
  userAuthenticationService.setServiceImplementation({
    // NestJS JWT is only for our API (viewerStateApi / measurementsApi via
    // localStorage). Never attach Bearer to public DICOMweb — it triggers CORS
    // preflight that CloudFront does not answer, breaking the study list.
    getAuthorizationHeader: () => ({}),
    handleUnauthenticated: () => {
      const redirect = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`
      );
      window.location.href = `/login?redirect=${redirect}`;
      return null;
    },
  });
}

export function bootstrapDentalAuth(userAuthenticationService: UserAuthenticationService): void {
  const token = getStoredToken();
  const user = getStoredUser();

  userAuthenticationService.set({ enabled: true, user: token ? user : null });
  applyDentalAuthServiceImplementation(userAuthenticationService);
  setDentalUnauthorizedHandler(() => handleUnauthorized(userAuthenticationService));
}

/** Re-apply after login so DICOMweb never keeps a stale Bearer implementation. */
export function refreshDentalAuthHeaders(
  userAuthenticationService: UserAuthenticationService
): void {
  applyDentalAuthServiceImplementation(userAuthenticationService);
}

export function logout(userAuthenticationService: UserAuthenticationService): void {
  userAuthenticationService.reset();
  userAuthenticationService.set({ enabled: true, user: null });
  signOutAndRedirect();
}

export function handleUnauthorized(
  userAuthenticationService: UserAuthenticationService
): void {
  userAuthenticationService.reset();
  userAuthenticationService.set({ enabled: true, user: null });
  const redirect = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`
  );
  clearAuth();
  window.location.href = `/login?redirect=${redirect}`;
}

export { handleDentalUnauthorized, type DentalFetchOptions };
