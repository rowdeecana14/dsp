import { getApiBase, handleDentalUnauthorized, type DentalFetchOptions } from '../../../shared/services/api';
import { getStoredToken } from '../../auth/services/authApi';
import { toApiSaveViewerStateBody, fromApiViewerState } from '../../measurements/services/dentalApiMappers';
import { serializeApiWireBody } from '../../../shared/services/wireMapper';
import type {
  ApiPaginatedResponse,
  ApiViewerStateRecord,
  ViewerStatePayload,
  ViewerStateRecord,
} from '../../measurements/types/measurement.types';

export type { ViewerStatePayload, ViewerStateRecord } from '../../measurements/types/measurement.types';

function authHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchViewerState(
  studyInstanceUID: string,
  options?: DentalFetchOptions
): Promise<ViewerStateRecord | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const res = await fetch(
      `${getApiBase()}/viewer-state/study/${encodeURIComponent(studyInstanceUID)}`,
      { headers: authHeaders() }
    );
    if (handleDentalUnauthorized(res.status, options)) {
      return null;
    }
    if (!res.ok) {
      console.warn('[dental] GET /viewer-state/study failed', res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { data?: ApiViewerStateRecord | null };
    return json?.data ? fromApiViewerState(json.data) : null;
  } catch (e) {
    console.warn('[dental] Failed to load viewer state', e);
    return null;
  }
}

export async function saveViewerState(payload: ViewerStatePayload): Promise<ViewerStateRecord | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const body = toApiSaveViewerStateBody(payload);
    const res = await fetch(`${getApiBase()}/viewer-state`, {
      method: 'POST',
      headers: authHeaders(),
      body: serializeApiWireBody(body),
    });
    if (handleDentalUnauthorized(res.status)) {
      return null;
    }
    if (!res.ok) {
      console.warn('[dental] POST /viewer-state failed', res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { data?: ApiViewerStateRecord };
    return json?.data ? fromApiViewerState(json.data) : null;
  } catch (e) {
    console.warn('[dental] Failed to save viewer state', e);
    return null;
  }
}

export async function updateViewerState(
  id: string,
  payload: Partial<ViewerStatePayload>
): Promise<ViewerStateRecord | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const body = toApiSaveViewerStateBody({
      study_instance_uid: payload.study_instance_uid ?? '',
      ...payload,
    });
    const res = await fetch(`${getApiBase()}/viewer-state/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: serializeApiWireBody(body),
    });
    if (handleDentalUnauthorized(res.status)) {
      return null;
    }
    if (!res.ok) {
      console.warn('[dental] PUT /viewer-state failed', res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { data?: ApiViewerStateRecord };
    return json?.data ? fromApiViewerState(json.data) : null;
  } catch (e) {
    console.warn('[dental] Failed to update viewer state', e);
    return null;
  }
}

export function hasAuthToken(): boolean {
  return !!getStoredToken();
}
