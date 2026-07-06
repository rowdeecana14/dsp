import { getStoredToken } from '../../auth/services/authApi';
import { getApiBase, handleDentalUnauthorized, type DentalFetchOptions } from '../../../shared/services/api';
import {
  toApiCreateMeasurementWireBody,
  toApiMeasurementsQueryParams,
  toApiPatchMeasurementWireBody,
  toApiPutMeasurementWireBody,
  serializeApiWireBody,
} from '../../../shared/services/wireMapper';
import {
  toApiSaveMeasurementsBody,
  flattenStudiesMeasurements,
} from './dentalApiMappers';
import { paginationMetaSchema } from '../schemas/measurement.schema';
import type {
  ApiStudiesMeasurementsSchema,
  ApiPaginatedResponse,
  ApiPaginationMeta,
  DentalMeasurementExport,
  UpdateMeasurementRequest,
  MeasurementRecord,
  CreateMeasurementRequest,
  PutMeasurementRequest,
  MeasurementsListQuery,
} from '../types/measurement.types';

export type {
  DentalMeasurementExport,
  UpdateMeasurementRequest,
  CreateMeasurementRequest,
  PutMeasurementRequest,
  MeasurementsListQuery,
  MeasurementsPageResult,
} from '../types/measurement.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isServerMeasurementId(id: string | undefined): id is string {
  return !!id && UUID_PATTERN.test(id);
}

function authHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchMeasurementsPage(
  query: MeasurementsListQuery
): Promise<MeasurementsPageResult | null> {
  const token = getStoredToken();
  if (!token || !query.study_instance_uid) {
    return null;
  }

  try {
    const params = toApiMeasurementsQueryParams(query);

    const res = await fetch(`${getApiBase()}/measurements?${params}`, {
      headers: authHeaders(),
    });
    if (handleDentalUnauthorized(res.status, query.fetchOptions)) {
      return null;
    }
    if (!res.ok) {
      const errorBody = await res.text();
      console.warn('[dental] GET /measurements failed', res.status, errorBody);
      return null;
    }

    const json = (await res.json()) as ApiPaginatedResponse<ApiStudiesMeasurementsSchema> & {
      meta?: ApiPaginationMeta;
      success?: boolean;
    };

    if (json.success === false) {
      console.warn('[dental] GET /measurements rejected', json);
      return null;
    }

    const measurements = flattenStudiesMeasurements(json?.data);
    const parsedMeta = paginationMetaSchema.safeParse(json.meta);
    const meta = parsedMeta.success
      ? parsedMeta.data
      : {
          total: measurements.length,
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          last_page: measurements.length > 0 ? 1 : 0,
          sort_by: query.sort_by ?? 'created_at',
          sort_order: query.sort_order ?? 'DESC',
        };

    if (meta.total === 0 && measurements.length > 0) {
      meta.total = measurements.length;
      meta.last_page = Math.max(1, Math.ceil(measurements.length / meta.limit));
    }

    return {
      measurements,
      meta,
    };
  } catch (e) {
    console.warn('[dental] Failed to load measurements page', e);
    return null;
  }
}

export async function fetchMeasurementsFromServer(
  study_instance_uid: string,
  viewer_state_id?: string,
  options?: DentalFetchOptions
): Promise<DentalMeasurementExport[]> {
  if (viewer_state_id) {
    const byState = await fetchMeasurementsByViewerState(viewer_state_id, options);
    if (byState.length > 0) {
      return byState;
    }
  }

  const result = await fetchMeasurementsPage({
    study_instance_uid,
    page: 1,
    limit: 100,
    sort_by: 'updated_at',
    sort_order: 'DESC',
    fetchOptions: options,
  });
  return result?.measurements ?? [];
}

export async function fetchMeasurementsByViewerState(
  viewer_state_id: string,
  options?: DentalFetchOptions
): Promise<DentalMeasurementExport[]> {
  const token = getStoredToken();
  if (!token || !viewer_state_id) {
    return [];
  }

  try {
    const res = await fetch(
      `${getApiBase()}/measurements/viewer-state/${encodeURIComponent(viewer_state_id)}`,
      { headers: authHeaders() }
    );
    if (handleDentalUnauthorized(res.status, options)) {
      return [];
    }
    if (!res.ok) {
      console.warn('[dental] GET /measurements/viewer-state failed', res.status, await res.text());
      return [];
    }
    const json = (await res.json()) as { data?: ApiStudiesMeasurementsSchema };
    return flattenStudiesMeasurements(json?.data);
  } catch (e) {
    console.warn('[dental] Failed to load measurements by viewer state', e);
    return [];
  }
}

export async function createMeasurementOnServer(
  body: CreateMeasurementRequest
): Promise<MeasurementRecord | null> {
  if (!getStoredToken()) {
    return null;
  }

  try {
    const res = await fetch(`${getApiBase()}/measurements/create`, {
      method: 'POST',
      headers: authHeaders(),
      body: serializeApiWireBody(toApiCreateMeasurementWireBody(body)),
    });
    if (handleDentalUnauthorized(res.status)) {
      return null;
    }
    if (!res.ok) {
      console.warn('[dental] POST /measurements/create failed', res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { data?: MeasurementRecord };
    return json?.data ?? null;
  } catch (e) {
    console.warn('[dental] Failed to create measurement', e);
    return null;
  }
}

export async function putMeasurementOnServer(
  id: string,
  body: PutMeasurementRequest
): Promise<MeasurementRecord | null> {
  if (!getStoredToken() || !isServerMeasurementId(id)) {
    return null;
  }

  try {
    const res = await fetch(`${getApiBase()}/measurements/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: serializeApiWireBody(toApiPutMeasurementWireBody(body)),
    });
    if (handleDentalUnauthorized(res.status)) {
      return null;
    }
    if (!res.ok) {
      console.warn('[dental] PUT /measurements failed', res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { data?: MeasurementRecord };
    return json?.data ?? null;
  } catch (e) {
    console.warn('[dental] Failed to put measurement', e);
    return null;
  }
}

export async function saveMeasurementsToServer(
  study_instance_uid: string,
  measurements: DentalMeasurementExport[]
): Promise<boolean> {
  if (!getStoredToken()) {
    return false;
  }

  try {
    const body = toApiSaveMeasurementsBody(study_instance_uid, measurements);
    const res = await fetch(`${getApiBase()}/measurements`, {
      method: 'POST',
      headers: authHeaders(),
      body: serializeApiWireBody(body),
    });
    if (handleDentalUnauthorized(res.status)) {
      return false;
    }
    if (!res.ok) {
      console.warn('[dental] POST /measurements failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[dental] Failed to save measurements', e);
    return false;
  }
}

export function downloadMeasurementsJson(
  study_instance_uid: string,
  measurements: DentalMeasurementExport[]
): void {
  const payload = toApiSaveMeasurementsBody(study_instance_uid, measurements);
  const blob = new Blob(
    [
      JSON.stringify(
        {
          ...payload,
          exported_at: new Date().toISOString(),
        },
        null,
        2
      ),
    ],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dental-measurements-${study_instance_uid.slice(-8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function updateMeasurementOnServer(
  id: string,
  body: UpdateMeasurementRequest
): Promise<MeasurementRecord | null> {
  if (!getStoredToken() || !isServerMeasurementId(id)) {
    return null;
  }

  try {
    const res = await fetch(`${getApiBase()}/measurements/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: serializeApiWireBody(toApiPatchMeasurementWireBody(body)),
    });
    if (handleDentalUnauthorized(res.status)) {
      return null;
    }
    if (!res.ok) {
      console.warn('[dental] PATCH /measurements failed', res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { data?: { measurement?: MeasurementRecord } };
    return json?.data?.measurement ?? null;
  } catch (e) {
    console.warn('[dental] Failed to update measurement', e);
    return null;
  }
}

export async function bulkUpdateMeasurementsOnServer(
  ids: string[],
  body: UpdateMeasurementRequest
): Promise<{ updated: MeasurementRecord[]; failed: string[] } | null> {
  const uniqueIds = [...new Set(ids.filter(id => isServerMeasurementId(id)))];
  if (!getStoredToken() || !uniqueIds.length) {
    return null;
  }

  try {
    const res = await fetch(`${getApiBase()}/measurements/bulk`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: serializeApiWireBody({
        ids: uniqueIds,
        ...toApiPatchMeasurementWireBody(body),
      }),
    });
    if (handleDentalUnauthorized(res.status)) {
      return null;
    }
    if (!res.ok) {
      console.warn('[dental] PATCH /measurements/bulk failed', res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as {
      data?: { updated?: MeasurementRecord[]; failed?: string[] };
    };
    return {
      updated: json?.data?.updated ?? [],
      failed: json?.data?.failed ?? [],
    };
  } catch (e) {
    console.warn('[dental] Failed to bulk update measurements', e);
    return null;
  }
}

export async function deleteMeasurementFromServer(id: string): Promise<boolean> {
  if (!getStoredToken() || !isServerMeasurementId(id)) {
    return false;
  }

  try {
    const res = await fetch(`${getApiBase()}/measurements/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (handleDentalUnauthorized(res.status)) {
      return false;
    }
    if (!res.ok) {
      console.warn('[dental] DELETE /measurements failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[dental] Failed to delete measurement', e);
    return false;
  }
}
