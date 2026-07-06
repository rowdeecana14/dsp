import type {
  ApiMeasurementRecord,
  ApiSaveMeasurementsBody,
  ApiSaveViewerStateBody,
  ApiStudiesMeasurementsSchema,
  ApiStudyMeasurements,
  ApiViewerStateRecord,
  DentalMeasurementExport,
  ViewerStatePayload,
  ViewerStateRecord,
} from '../types/measurement.types';
import {
  resolveDentalMeasurementLabel,
  resolveDentalPresetId,
  getDentalPresetForMeasurement,
  useDentalStore,
} from '../../dental/store/dental.store';
import { ToothSystem } from '../../../shared/utils/toothNumbering';
import { getActiveViewportSlot } from '../../../shared/utils/viewportConfig';
import {
  toApiCoordinatesWire,
  toApiMeasurementWireBody,
  toApiMeasurementsSaveWireBody,
  toApiViewerStateWireBody,
} from '../../../shared/services/wireMapper';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UNKNOWN_SERIES = 'unknown-series';

function resolveSeriesId(measurement: DentalMeasurementExport): string {
  const coordinates = measurement.coordinates ?? {};
  return String(
    coordinates.series_id ??
      coordinates.series_instance_uid ??
      coordinates.reference_series_uid ??
      UNKNOWN_SERIES
  );
}

function fromApiCoordinates(coordinates?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!coordinates) {
    return undefined;
  }

  const seriesId =
    coordinates.series_id ??
    coordinates.series_instance_uid ??
    coordinates.reference_series_uid;

  return {
    ...coordinates,
    ...(seriesId
      ? {
          series_id: seriesId,
          series_instance_uid: seriesId,
          reference_series_uid: seriesId,
        }
      : {}),
  };
}

export function groupMeasurementsToStudiesSchema(
  study_instance_uid: string,
  measurements: DentalMeasurementExport[]
): ApiSaveMeasurementsBody {
  const seriesMap = new Map<string, DentalMeasurementExport[]>();

  measurements.forEach(measurement => {
    const seriesId = resolveSeriesId(measurement);
    const bucket = seriesMap.get(seriesId) ?? [];
    bucket.push(measurement);
    seriesMap.set(seriesId, bucket);
  });

  return {
    studies: [
      {
        study_instance_uid,
        series: Array.from(seriesMap.entries()).map(([series_id, items]) => ({
          series_id,
          measurements: items.map(toApiMeasurement),
        })),
      },
    ],
  };
}

export function flattenStudiesMeasurements(
  input: ApiStudiesMeasurementsSchema | ApiStudyMeasurements[] | unknown
): DentalMeasurementExport[] {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    if (input.length === 0) {
      return [];
    }

    const first = input[0] as ApiStudyMeasurements | ApiMeasurementRecord;
    if ('series' in first) {
      return flattenStudiesMeasurements({ studies: input as ApiStudyMeasurements[] });
    }

    return (input as ApiMeasurementRecord[]).map(fromApiMeasurement);
  }

  if (typeof input === 'object' && 'studies' in input) {
    const schema = input as ApiStudiesMeasurementsSchema;
    const flattened: DentalMeasurementExport[] = [];

    schema.studies?.forEach(study => {
      const studySeries = study.series ?? [];
      studySeries.forEach(series => {
        const seriesId =
          series.series_id ??
          (series as { series_instance_uid?: string }).series_instance_uid ??
          UNKNOWN_SERIES;
        series.measurements?.forEach(measurement => {
          flattened.push(
            fromApiMeasurement({
              ...measurement,
              coordinates: fromApiCoordinates({
                ...(measurement.coordinates ?? {}),
                series_id: seriesId,
              }),
            })
          );
        });
      });
    });

    return flattened;
  }

  return [];
}

export function mapMeasurementToExport(
  measurement: Record<string, unknown>,
  context?: {
    viewer_state_id?: string;
    viewport?: string;
  }
): DentalMeasurementExport {
  const displayText = measurement.displayText as { primary?: string[] } | undefined;
  const primary = displayText?.primary?.filter(Boolean) ?? [];
  const uid = String((measurement as { uid?: string }).uid ?? '');
  const dentalPresetId = resolveDentalPresetId({
    dentalPresetId:
      (measurement as { dentalPresetId?: string }).dentalPresetId ??
      getDentalPresetForMeasurement(uid),
    dental_preset_id: (measurement as { dental_preset_id?: string }).dental_preset_id,
    label: measurement.label,
    toolName: measurement.toolName,
    type: measurement.type,
    unit: (measurement as { unit?: string }).unit,
  });
  const label = resolveDentalMeasurementLabel({
    label: measurement.label,
    toolName: measurement.toolName,
    type: measurement.type,
    dental_preset_id: dentalPresetId,
  });
  const unit = String((measurement as { unit?: string }).unit ?? '').trim() || 'mm';
  const tool = String(measurement.toolName ?? measurement.type ?? 'Length').trim() || 'Length';
  const value =
    primary.length > 0 ? primary.join(' ') : label !== 'Measurement' ? label : `0 ${unit}`;

  const exportId = UUID_PATTERN.test(uid) ? uid : undefined;
  const isLocked = (measurement as { isLocked?: boolean }).isLocked === true;
  const isVisible = (measurement as { isVisible?: boolean }).isVisible;

  const PRESET_TO_TYPE: Record<string, string> = {
    'pa-length': 'PA_LENGTH',
    'canal-angle': 'CANAL_ANGLE',
    'crown-width': 'CROWN_WIDTH',
    'root-length': 'ROOT_LENGTH',
  };

  const imageId =
    (measurement as { referencedImageId?: string }).referencedImageId ??
    (measurement as { displaySetInstanceUID?: string }).displaySetInstanceUID ??
    (measurement.metadata as { referencedImageId?: string } | undefined)?.referencedImageId;

  const selectedTooth =
    String(
      (measurement as { selected_tooth?: string }).selected_tooth ??
        (measurement as { selectedTooth?: string }).selectedTooth ??
        ''
    ).trim() || useDentalStore.getState().selectedTooth;

  return {
    ...(exportId ? { id: exportId } : {}),
    ...(context?.viewer_state_id ? { viewer_state_id: context.viewer_state_id } : {}),
    label,
    value: value.trim() || `0 ${unit}`,
    unit,
    tool,
    type: dentalPresetId ? PRESET_TO_TYPE[dentalPresetId] : undefined,
    ...(context?.viewport ? { viewport: context.viewport } : {}),
    ...(imageId ? { image_id: String(imageId) } : {}),
    captured_at: new Date(
      (measurement as { createdAt?: number }).createdAt ?? Date.now()
    ).toISOString(),
    dental_preset_id: dentalPresetId,
    coordinates: toApiCoordinatesWire({
      points: measurement.points,
      frameOfReferenceUID: measurement.frameOfReferenceUID,
      referenceSeriesUID: measurement.referenceSeriesUID,
      series_id: measurement.referenceSeriesUID,
      SOPInstanceUID: measurement.SOPInstanceUID,
      referencedImageId:
        (measurement as { referencedImageId?: string }).referencedImageId ??
        (measurement.metadata as { referencedImageId?: string } | undefined)?.referencedImageId,
      displaySetInstanceUID: (measurement as { displaySetInstanceUID?: string })
        .displaySetInstanceUID,
      dental_preset_id: dentalPresetId,
      selected_tooth: selectedTooth,
      ...(isLocked ? { is_locked: true } : {}),
      ...(isVisible === false ? { is_visible: false } : {}),
    }),
  };
}

export function toApiMeasurement(measurement: DentalMeasurementExport): ApiMeasurementRecord {
  return toApiMeasurementWireBody(measurement);
}

export function fromApiMeasurement(record: ApiMeasurementRecord): DentalMeasurementExport {
  const coordinates = record.coordinates ?? {};
  const dentalPresetFromCoords =
    typeof coordinates.dental_preset_id === 'string' ? coordinates.dental_preset_id : undefined;

  const label = resolveDentalMeasurementLabel({
    label: record.label,
    toolName: record.tool,
    dental_preset_id: record.dental_preset_id ?? dentalPresetFromCoords,
  });
  const unit = record.unit?.trim() || 'mm';
  const value = record.value?.trim() || `0 ${unit}`;

  return {
    id: record.id,
    viewer_state_id: record.viewer_state_id,
    label,
    value,
    unit,
    tool: record.tool?.trim() || 'Length',
    type: record.type,
    viewport: record.viewport,
    image_id: record.image_id,
    captured_at: record.captured_at,
    dental_preset_id: record.dental_preset_id ?? dentalPresetFromCoords,
    coordinates: fromApiCoordinates(coordinates as Record<string, unknown>),
  };
}

export function toApiSaveMeasurementsBody(
  study_instance_uid: string,
  measurements: DentalMeasurementExport[]
): ApiSaveMeasurementsBody {
  return toApiMeasurementsSaveWireBody(study_instance_uid, measurements);
}

export function toApiSaveViewerStateBody(
  payload: ViewerStatePayload
): ApiSaveViewerStateBody {
  return toApiViewerStateWireBody(payload);
}

export function fromApiViewerState(record: ApiViewerStateRecord): ViewerStateRecord {
  return {
    id: record.id,
    study_instance_uid: record.study_instance_uid ?? '',
    mode: record.mode,
    theme: record.theme,
    selected_tooth: record.selected_tooth,
    tooth_system: record.tooth_system,
    viewport_layout: record.viewport_layout,
    patient_id: record.patient_id,
    viewport_config: record.viewport_config,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

export function isDentalStudyDisplayReady(
  displaySetService: {
    getActiveDisplaySets: () => Array<{ StudyInstanceUID?: string; instances?: unknown[]; imageIds?: string[] }>;
  },
  studyInstanceUID: string
): boolean {
  const activeUid = displaySetService.getActiveDisplaySets()[0]?.StudyInstanceUID;
  if (activeUid !== studyInstanceUID) {
    return false;
  }

  return displaySetService.getActiveDisplaySets().some(displaySet => {
    const hasInstances = (displaySet.instances?.length ?? 0) > 0;
    const hasImages = (displaySet.imageIds?.length ?? 0) > 0;
    return hasInstances || hasImages;
  });
}

export function getActiveStudyInstanceUID(
  displaySetService: { getActiveDisplaySets: () => Array<{ StudyInstanceUID?: string }> }
): string | null {
  const sets = displaySetService.getActiveDisplaySets();
  return sets[0]?.StudyInstanceUID ?? null;
}

export function getActiveSeriesInstanceUIDs(
  displaySetService: {
    getActiveDisplaySets: () => Array<{ SeriesInstanceUID?: string; seriesInstanceUID?: string }>;
  }
): string[] {
  const seriesIds = new Set<string>();

  displaySetService.getActiveDisplaySets().forEach(displaySet => {
    const seriesUid = displaySet.SeriesInstanceUID ?? displaySet.seriesInstanceUID;
    if (seriesUid) {
      seriesIds.add(seriesUid);
    }
  });

  return Array.from(seriesIds);
}

/** Series shown in the active viewport (study-browser selection / focused cell). */
export function getFocusedSeriesInstanceUIDs(
  displaySetService: {
    getDisplaySetByUID: (
      uid: string
    ) => { SeriesInstanceUID?: string; seriesInstanceUID?: string } | undefined;
    getActiveDisplaySets: () => Array<{ SeriesInstanceUID?: string; seriesInstanceUID?: string }>;
  },
  viewportGridService: {
    getActiveViewportId: () => string | undefined;
    getDisplaySetsUIDsForViewport: (viewportId: string) => string[] | undefined;
  }
): string[] {
  const seriesIds = new Set<string>();

  const collectFromViewport = (viewportId: string | undefined) => {
    if (!viewportId) {
      return;
    }

    const displaySetUIDs = viewportGridService.getDisplaySetsUIDsForViewport(viewportId) ?? [];
    displaySetUIDs.forEach(uid => {
      const displaySet = displaySetService.getDisplaySetByUID(uid);
      const seriesUid = displaySet?.SeriesInstanceUID ?? displaySet?.seriesInstanceUID;
      if (seriesUid) {
        seriesIds.add(seriesUid);
      }
    });
  };

  collectFromViewport(viewportGridService.getActiveViewportId());

  if (!seriesIds.size) {
    collectFromViewport('dental-current');
  }

  if (!seriesIds.size) {
    return getActiveSeriesInstanceUIDs(displaySetService);
  }

  return Array.from(seriesIds);
}

export function resolveLiveMeasurementSeriesId(
  measurement: Record<string, unknown>
): string | undefined {
  const referenceSeriesUID = measurement.referenceSeriesUID;
  if (typeof referenceSeriesUID === 'string' && referenceSeriesUID.length > 0) {
    return referenceSeriesUID;
  }

  return undefined;
}

export function resolveSavedMeasurementSeriesId(
  saved: DentalMeasurementExport
): string | undefined {
  const coordinates = saved.coordinates ?? {};
  const seriesId =
    coordinates.series_id ??
    coordinates.reference_series_uid ??
    coordinates.series_instance_uid;

  return typeof seriesId === 'string' && seriesId.length > 0 ? seriesId : undefined;
}

export function measurementMatchesActiveSeries(
  seriesId: string | undefined,
  activeSeriesIds: string[]
): boolean {
  if (!activeSeriesIds.length) {
    return true;
  }

  if (!seriesId || seriesId === UNKNOWN_SERIES) {
    return true;
  }

  return activeSeriesIds.includes(seriesId);
}

export function getMeasurementsForExport(
  measurementService: { getMeasurements: () => Record<string, unknown>[] },
  context?: {
    viewer_state_id?: string;
    viewportGridService?: { getActiveViewportId: () => string | undefined };
  }
): DentalMeasurementExport[] {
  const viewport = context?.viewportGridService
    ? getActiveViewportSlot(context.viewportGridService)
    : undefined;

  return measurementService
    .getMeasurements()
    .map(measurement =>
      mapMeasurementToExport(measurement, {
        viewer_state_id: context?.viewer_state_id,
        viewport,
      })
    );
}

export function getAllDentalMeasurementsForSave(
  measurementService: { getMeasurements: () => Record<string, unknown>[] },
  serverMeasurements: DentalMeasurementExport[],
  context?: {
    viewer_state_id?: string;
    viewportGridService?: { getActiveViewportId: () => string | undefined };
  }
): DentalMeasurementExport[] {
  const live = getMeasurementsForExport(measurementService, context);
  const liveIds = new Set(live.map(measurement => measurement.id).filter(Boolean));

  const serverOnly = serverMeasurements.filter(
    saved => !saved.id || !liveIds.has(saved.id)
  );

  return [...live, ...serverOnly];
}

function normalizePointsForCompare(points: unknown): string {
  if (!Array.isArray(points)) {
    return '[]';
  }

  const round = (value: unknown): unknown => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.round(value * 10000) / 10000;
    }
    if (Array.isArray(value)) {
      return value.map(round);
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
          key,
          round(entry),
        ])
      );
    }
    return value;
  };

  try {
    return JSON.stringify(round(points));
  } catch {
    return '[]';
  }
}

function measurementContentSignature(
  measurement: DentalMeasurementExport
): string {
  const api = toApiMeasurement(measurement);
  const coordinates = api.coordinates ?? {};

  return JSON.stringify({
    label: api.label,
    value: api.value,
    unit: api.unit,
    tool: api.tool,
    dental_preset_id: api.dental_preset_id ?? null,
    series_id: coordinates.series_id ?? null,
    points: normalizePointsForCompare(coordinates.points),
    is_locked: coordinates.is_locked === true,
    is_visible: coordinates.is_visible === false ? false : true,
  });
}

/** Stable fingerprint of the save payload — ignores volatile fields like captured_at. */
export function computeMeasurementsSaveFingerprint(
  measurements: DentalMeasurementExport[]
): string {
  return measurements
    .map(measurement => {
      const api = toApiMeasurement(measurement);
      const id = api.id ?? `new:${measurementContentSignature(measurement)}`;
      return `${id}::${measurementContentSignature(measurement)}`;
    })
    .sort()
    .join('|');
}

/** True when the viewer save payload differs from the last synced fingerprint. */
export function hasUnsavedMeasurementChanges(
  measurementService: { getMeasurements: () => Record<string, unknown>[] },
  serverMeasurements: DentalMeasurementExport[],
  syncedSaveFingerprint: string | null = null
): boolean {
  const pending = getAllDentalMeasurementsForSave(measurementService, serverMeasurements);
  const currentFingerprint = computeMeasurementsSaveFingerprint(pending);

  if (syncedSaveFingerprint) {
    return currentFingerprint !== syncedSaveFingerprint;
  }

  const serverFingerprint = computeMeasurementsSaveFingerprint(serverMeasurements);
  return currentFingerprint !== serverFingerprint;
}

export type { DentalMeasurementExport, ViewerStatePayload, ViewerStateRecord };

export {
  toApiCoordinatesWire,
  toApiViewerStateWireBody,
  toApiMeasurementWireBody,
  toApiMeasurementsSaveWireBody,
  toApiCreateMeasurementWireBody,
  toApiPutMeasurementWireBody,
  toApiPatchMeasurementWireBody,
  toApiMeasurementsQueryParams,
  serializeApiWireBody,
} from '../../../shared/services/wireMapper';
