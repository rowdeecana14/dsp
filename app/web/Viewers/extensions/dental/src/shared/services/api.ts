const DEFAULT_API_BASE = 'http://localhost:3000/api/v1';

type DentalAppConfig = AppTypes.Config & { dentalApiUrl?: string };

export function getApiBase(): string {
  if (typeof window !== 'undefined' && window.config) {
    const url = (window.config as DentalAppConfig).dentalApiUrl;
    if (url) {
      return url.replace(/\/$/, '');
    }
  }
  return DEFAULT_API_BASE;
}

export type DentalFetchOptions = {
  /** When false, 401 responses do not redirect to login (use during background study load). */
  redirectOnUnauthorized?: boolean;
};

let unauthorizedHandler: (() => void) | null = null;

export function setDentalUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export function notifyDentalUnauthorized(): void {
  unauthorizedHandler?.();
}

export function handleDentalUnauthorized(
  status: number,
  options?: DentalFetchOptions
): boolean {
  if (status !== 401) {
    return false;
  }

  if (options?.redirectOnUnauthorized !== false) {
    notifyDentalUnauthorized();
  }

  return true;
}
