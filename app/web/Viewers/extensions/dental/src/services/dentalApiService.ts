import { dentalMeasurementStore, DentalMeasurement } from './dentalMeasurementStore';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

function getAuthToken(): string | null {
  return localStorage.getItem('dental_auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('dental_auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('dental_auth_token');
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API error ${response.status}`);
  }
  return response.json();
}

export interface ViewerStatePayload {
  study_instance_uid: string;
  mode?: string;
  theme?: string;
  selected_tooth?: string;
  tooth_system?: 'FDI' | 'Universal';
  viewport_layout?: string;
  measurements?: DentalMeasurement[];
}

export async function saveViewerState(payload: ViewerStatePayload) {
  return apiRequest('/viewer-state', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loadViewerState(studyInstanceUid: string) {
  const result = await apiRequest<{ data?: { items?: ViewerStatePayload[] } }>(
    `/viewer-state?study_instance_uid=${encodeURIComponent(studyInstanceUid)}&limit=1`
  );
  return result?.data?.items?.[0] ?? null;
}

export async function saveMeasurementsToApi(studyInstanceUid: string, items: DentalMeasurement[]) {
  return apiRequest('/measurements', {
    method: 'POST',
    body: JSON.stringify({
      study_instance_uid: studyInstanceUid,
      measurements: items.map(m => ({
        label: m.label,
        value: m.value,
        unit: m.unit,
        tool: m.tool,
        captured_at: m.capturedAt,
        coordinates: m.coordinates,
      })),
    }),
  });
}

export async function login(email: string, password: string) {
  const result = await apiRequest<{ data?: { token?: string; access_token?: string }; token?: string }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );
  const token = result?.data?.token ?? result?.data?.access_token ?? result?.token;
  if (token) {
    setAuthToken(token);
  }
  return result;
}

export function exportMeasurementsJson(studyInstanceUid: string, practiceName: string) {
  const measurements = dentalMeasurementStore.getMeasurements();
  const payload = {
    exportedAt: new Date().toISOString(),
    practiceName,
    studyInstanceUid,
    measurements,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `dental-measurements-${studyInstanceUid.slice(-8)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
