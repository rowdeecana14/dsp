/**
 * Canonical snake_case wire mapper for all dental → API payloads.
 * OHIF / internal camelCase is normalized here before fetch().
 */

import type {
  ApiMeasurementRecord,
  ApiSaveMeasurementsBody,
  ApiSaveViewerStateBody,
  CreateMeasurementRequest,
  DentalMeasurementExport,
  MeasurementCoordinates,
  MeasurementsListQuery,
  PutMeasurementRequest,
  UpdateMeasurementRequest,
  ViewerStatePayload,
  ViewportConfig,
} from '../../modules/measurements/types/measurement.types';

const VIEWER_STATE_WIRE_KEYS = [
  'study_instance_uid',
  'mode',
  'theme',
  'selected_tooth',
  'tooth_system',
  'viewport_layout',
  'patient_id',
  'viewport_config',
] as const;

const MEASUREMENT_WIRE_KEYS = [
  'id',
  'viewer_state_id',
  'label',
  'value',
  'unit',
  'tool',
  'type',
  'viewport',
  'image_id',
  'captured_at',
  'dental_preset_id',
  'series_id',
  'coordinates',
] as const;

const COORDINATE_WIRE_KEYS = [
  'points',
  'frame_of_reference_uid',
  'sop_instance_uid',
  'referenced_image_id',
  'display_set_instance_uid',
  'is_locked',
  'is_visible',
  'series_id',
  'series_instance_uid',
  'reference_series_uid',
  'dental_preset_id',
] as const;

const PATCH_WIRE_KEYS = ['action', 'label', 'is_locked'] as const;

const PUT_WIRE_KEYS = [
  'label',
  'value',
  'unit',
  'tool',
  'type',
  'viewport',
  'image_id',
  'dental_preset_id',
  'coordinates',
] as const;

const CREATE_WIRE_KEYS = [
  'study_instance_uid',
  'viewer_state_id',
  'label',
  'value',
  'unit',
  'tool',
  'type',
  'viewport',
  'image_id',
  'dental_preset_id',
  'series_id',
  'captured_at',
  'coordinates',
] as const;

const VIEWER_STATE_KEY_ALIASES: Record<string, string> = {
  studyInstanceUID: 'study_instance_uid',
  StudyInstanceUID: 'study_instance_uid',
  selectedTooth: 'selected_tooth',
  toothSystem: 'tooth_system',
  viewportLayout: 'viewport_layout',
  patientId: 'patient_id',
  viewportConfig: 'viewport_config',
};

const MEASUREMENT_KEY_ALIASES: Record<string, string> = {
  viewerStateId: 'viewer_state_id',
  dentalPresetId: 'dental_preset_id',
  imageId: 'image_id',
  capturedAt: 'captured_at',
  studyInstanceUID: 'study_instance_uid',
  seriesId: 'series_id',
};

const COORDINATE_KEY_ALIASES: Record<string, string> = {
  frameOfReferenceUID: 'frame_of_reference_uid',
  SOPInstanceUID: 'sop_instance_uid',
  referencedImageId: 'referenced_image_id',
  displaySetInstanceUID: 'display_set_instance_uid',
  referenceSeriesUID: 'reference_series_uid',
  seriesInstanceUID: 'series_instance_uid',
  dentalPresetId: 'dental_preset_id',
  isLocked: 'is_locked',
  isVisible: 'is_visible',
};

const QUERY_KEY_ALIASES: Record<string, string> = {
  studyInstanceUID: 'study_instance_uid',
  sortBy: 'sort_by',
  sortOrder: 'sort_order',
  dentalPresetId: 'dental_preset_id',
  seriesIds: 'series_ids',
};

function resolveWireKey(
  key: string,
  aliases: Record<string, string>
): string {
  return aliases[key] ?? key;
}

function pickWireFields<T extends string>(
  source: Record<string, unknown>,
  allowed: readonly T[],
  aliases: Record<string, string> = {}
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [rawKey, value] of Object.entries(source)) {
    if (value === undefined) {
      continue;
    }

    const wireKey = resolveWireKey(rawKey, aliases);
    if ((allowed as readonly string[]).includes(wireKey)) {
      result[wireKey] = value;
    }
  }

  return result;
}

export function toApiCoordinatesWire(
  coordinates?: Record<string, unknown> | null
): MeasurementCoordinates | undefined {
  if (!coordinates) {
    return undefined;
  }

  const normalized: Record<string, unknown> = {};

  for (const [rawKey, value] of Object.entries(coordinates)) {
    if (value === undefined) {
      continue;
    }
    const wireKey = resolveWireKey(rawKey, COORDINATE_KEY_ALIASES);
    if ((COORDINATE_WIRE_KEYS as readonly string[]).includes(wireKey)) {
      normalized[wireKey] = value;
    }
  }

  const seriesId =
    normalized.series_id ??
    normalized.series_instance_uid ??
    normalized.reference_series_uid;

  const api: MeasurementCoordinates = {};

  if (normalized.points !== undefined) {
    api.points = normalized.points as MeasurementCoordinates['points'];
  }

  const frameOfReference = normalized.frame_of_reference_uid;
  if (frameOfReference) {
    api.frame_of_reference_uid = String(frameOfReference);
  }

  const sopInstance = normalized.sop_instance_uid;
  if (sopInstance) {
    api.sop_instance_uid = String(sopInstance);
  }

  const referencedImage = normalized.referenced_image_id;
  if (referencedImage) {
    api.referenced_image_id = String(referencedImage);
  }

  const displaySet = normalized.display_set_instance_uid;
  if (displaySet) {
    api.display_set_instance_uid = String(displaySet);
  }

  if (normalized.is_locked === true) {
    api.is_locked = true;
  }

  if (normalized.is_visible === false) {
    api.is_visible = false;
  }

  const dentalPresetId = normalized.dental_preset_id;
  if (dentalPresetId) {
    api.dental_preset_id = String(dentalPresetId);
  }

  if (seriesId) {
    api.series_id = String(seriesId);
  }

  return Object.keys(api).length > 0 ? api : undefined;
}

function toViewportConfigWire(
  config?: ViewportConfig | Record<string, unknown> | null
): ViewportConfig | undefined {
  if (!config) {
    return undefined;
  }

  const wire = pickWireFields(
    config as Record<string, unknown>,
    ['top_left', 'top_right', 'bottom_left', 'bottom_right', 'bottom'],
  );

  return Object.keys(wire).length > 0 ? (wire as ViewportConfig) : undefined;
}

export function toApiViewerStateWireBody(
  payload: ViewerStatePayload | Record<string, unknown>
): ApiSaveViewerStateBody {
  const picked = pickWireFields(
    payload as Record<string, unknown>,
    VIEWER_STATE_WIRE_KEYS,
    VIEWER_STATE_KEY_ALIASES,
  ) as ApiSaveViewerStateBody;

  if (picked.viewport_config) {
    const viewportConfig = toViewportConfigWire(
      picked.viewport_config as Record<string, unknown>
    );
    if (viewportConfig) {
      picked.viewport_config = viewportConfig;
    } else {
      delete picked.viewport_config;
    }
  }

  return picked;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function toApiMeasurementWireBody(
  measurement: DentalMeasurementExport | Record<string, unknown>
): ApiMeasurementRecord {
  const picked = pickWireFields(
    measurement as Record<string, unknown>,
    MEASUREMENT_WIRE_KEYS,
    MEASUREMENT_KEY_ALIASES,
  ) as ApiMeasurementRecord;

  const label = String(picked.label ?? '').trim() || 'Measurement';
  const unit = String(picked.unit ?? '').trim() || 'mm';
  const value = String(picked.value ?? '').trim() || `0 ${unit}`;
  const tool = String(picked.tool ?? '').trim() || 'Length';

  const api: ApiMeasurementRecord = {
    ...picked,
    label,
    value,
    unit,
    tool,
    captured_at: String(picked.captured_at ?? new Date().toISOString()),
  };

  if (api.id && !UUID_PATTERN.test(api.id)) {
    delete api.id;
  }

  const coordinates = toApiCoordinatesWire(
    (measurement as DentalMeasurementExport).coordinates ??
      (picked.coordinates as Record<string, unknown> | undefined)
  );

  if (coordinates) {
    api.coordinates = coordinates;
  } else {
    delete api.coordinates;
  }

  return api;
}

export function toApiMeasurementsSaveWireBody(
  study_instance_uid: string,
  measurements: DentalMeasurementExport[]
): ApiSaveMeasurementsBody {
  const seriesMap = new Map<string, ApiMeasurementRecord[]>();

  measurements.forEach(measurement => {
    const api = toApiMeasurementWireBody(measurement);
    const seriesId =
      api.coordinates?.series_id ??
      (measurement.coordinates?.series_id as string | undefined) ??
      'unknown-series';

    const bucket = seriesMap.get(seriesId) ?? [];
    bucket.push(api);
    seriesMap.set(seriesId, bucket);
  });

  return {
    studies: [
      {
        study_instance_uid,
        series: Array.from(seriesMap.entries()).map(([series_id, items]) => ({
          series_id,
          measurements: items,
        })),
      },
    ],
  };
}

export function toApiCreateMeasurementWireBody(
  body: CreateMeasurementRequest | Record<string, unknown>
): CreateMeasurementRequest {
  const picked = pickWireFields(
    body as Record<string, unknown>,
    CREATE_WIRE_KEYS,
    MEASUREMENT_KEY_ALIASES,
  ) as CreateMeasurementRequest;

  const coordinates = toApiCoordinatesWire(
    (body as CreateMeasurementRequest).coordinates as Record<string, unknown> | undefined
  );
  if (coordinates) {
    picked.coordinates = coordinates;
  }

  return picked;
}

export function toApiPutMeasurementWireBody(
  body: PutMeasurementRequest | Record<string, unknown>
): PutMeasurementRequest {
  const picked = pickWireFields(
    body as Record<string, unknown>,
    PUT_WIRE_KEYS,
    MEASUREMENT_KEY_ALIASES,
  ) as PutMeasurementRequest;

  const coordinates = toApiCoordinatesWire(
    (body as PutMeasurementRequest).coordinates as Record<string, unknown> | undefined
  );
  if (coordinates) {
    picked.coordinates = coordinates;
  }

  return picked;
}

export function toApiPatchMeasurementWireBody(
  body: UpdateMeasurementRequest | Record<string, unknown>
): UpdateMeasurementRequest {
  return pickWireFields(
    body as Record<string, unknown>,
    PATCH_WIRE_KEYS,
    { isLocked: 'is_locked' },
  ) as UpdateMeasurementRequest;
}

export function toApiMeasurementsQueryParams(
  query: MeasurementsListQuery | Record<string, unknown>
): URLSearchParams {
  const normalized = pickWireFields(
    query as Record<string, unknown>,
    [
      'study_instance_uid',
      'page',
      'limit',
      'sort_by',
      'sort_order',
      'search',
      'dental_preset_id',
      'series_ids',
    ],
    QUERY_KEY_ALIASES,
  );

  const studyInstanceUid = String(normalized.study_instance_uid ?? '');
  const params = new URLSearchParams({
    study_instance_uid: studyInstanceUid,
    page: String(normalized.page ?? 1),
    limit: String(normalized.limit ?? 10),
    sort_by: String(normalized.sort_by ?? 'created_at'),
    sort_order: String(normalized.sort_order ?? 'DESC'),
  });

  const search = typeof normalized.search === 'string' ? normalized.search.trim() : '';
  if (search) {
    params.set('search', search);
  }

  const presetId =
    typeof normalized.dental_preset_id === 'string'
      ? normalized.dental_preset_id.trim()
      : '';
  if (presetId) {
    params.set('dental_preset_id', presetId);
  }

  const seriesIds = normalized.series_ids;
  if (typeof seriesIds === 'string' && seriesIds.trim()) {
    params.set('series_ids', seriesIds.trim());
  }

  return params;
}

export function serializeApiWireBody(body: unknown): string {
  return JSON.stringify(body);
}
