import { utils } from '@ohif/core';
import { annotation } from '@cornerstonejs/tools';
import {
  CORNERSTONE_3D_TOOLS_SOURCE_NAME,
  CORNERSTONE_3D_TOOLS_SOURCE_VERSION,
} from '../../../../../cornerstone/src/enums';
import type { DentalMeasurementExport } from '../types/measurement.types';
import { getServerMeasurementUid } from './dentalPersistence';
import {
  getDentalPresetForMeasurement,
  rememberDentalPresetForMeasurement,
  rememberDentalMeasurementLabel,
  getDentalMeasurementLabel,
  resolveDentalMeasurementLabel,
  resolveDentalPresetId,
} from '../../dental/store/dental.store';
import {
  measurementMatchesActiveSeries,
  resolveSavedMeasurementSeriesId,
} from './dentalApiMappers';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SUPPORTED_RESTORE_TOOLS = new Set(['Length', 'Angle', 'Bidirectional']);

function getMinimumPointsForRestoreTool(tool: string): number {
  switch (tool) {
    case 'Angle':
    case 'CobbAngle':
      return 3;
    case 'Bidirectional':
      return 4;
    default:
      return 2;
  }
}

function hasValidRestorePoints(tool: string, points: unknown): boolean {
  return Array.isArray(points) && points.length >= getMinimumPointsForRestoreTool(tool);
}

type RestoreDisplaySetService = {
  getDisplaySetForSOPInstanceUID: (
    sopInstanceUID: string,
    seriesInstanceUID: string
  ) => { imageIds?: string[]; instances?: Array<{ SOPInstanceUID?: string }> } | undefined;
  getDisplaySetsForSeries: (
    seriesInstanceUID: string
  ) => Array<{ imageIds?: string[]; instances?: Array<{ SOPInstanceUID?: string }> }>;
  getActiveDisplaySets: () => Array<{ displaySetInstanceUID?: string }>;
};

function normalizeRestoreCoordinates(
  coordinates: Record<string, unknown>
): Record<string, unknown> {
  const seriesId =
    coordinates.series_id ??
    coordinates.referenceSeriesUID ??
    coordinates.reference_series_uid ??
    coordinates.series_instance_uid;

  return {
    ...coordinates,
    referencedImageId: coordinates.referencedImageId ?? coordinates.referenced_image_id,
    referenceSeriesUID:
      coordinates.referenceSeriesUID ?? coordinates.reference_series_uid ?? seriesId,
    SOPInstanceUID: coordinates.SOPInstanceUID ?? coordinates.sop_instance_uid,
    frameOfReferenceUID:
      coordinates.frameOfReferenceUID ?? coordinates.frame_of_reference_uid,
    displaySetInstanceUID:
      coordinates.displaySetInstanceUID ?? coordinates.display_set_instance_uid,
    series_id: seriesId,
  };
}

function resolveReferencedImageId(
  coordinates: Record<string, unknown>,
  displaySetService: RestoreDisplaySetService
): string | null {
  const normalized = normalizeRestoreCoordinates(coordinates);
  const savedImageId = normalized.referencedImageId;
  if (typeof savedImageId === 'string' && savedImageId.length > 0) {
    return savedImageId;
  }

  const sopInstanceUID = normalized.SOPInstanceUID;
  const referenceSeriesUID = normalized.referenceSeriesUID;
  if (typeof referenceSeriesUID !== 'string' || !referenceSeriesUID) {
    return null;
  }

  if (typeof sopInstanceUID === 'string' && sopInstanceUID.length > 0) {
    const displaySet = displaySetService.getDisplaySetForSOPInstanceUID(
      sopInstanceUID,
      referenceSeriesUID
    );
    if (displaySet) {
      const imageIds = displaySet.imageIds as string[] | undefined;
      if (imageIds?.length) {
        const instanceIndex =
          displaySet.instances?.findIndex(
            instance => instance.SOPInstanceUID === sopInstanceUID
          ) ?? -1;
        return imageIds[instanceIndex >= 0 ? instanceIndex : 0] ?? null;
      }
    }
  }

  const displaySets = displaySetService.getDisplaySetsForSeries(referenceSeriesUID);
  const fallbackDisplaySet = displaySets[0];
  const imageIds = fallbackDisplaySet?.imageIds as string[] | undefined;
  return imageIds?.[0] ?? null;
}

type RestoreAnnotationPayload = {
  uid: string;
  annotation: {
    annotationUID: string;
    data: {
      label: string;
      handles: {
        points: unknown[];
        activeHandleIndex: null;
        textBox: {
          hasMoved: boolean;
          worldPosition: unknown;
        };
      };
      cachedStats: Record<string, unknown>;
    };
    metadata: {
      toolName: string;
      referencedImageId: string;
      FrameOfReferenceUID?: string;
    };
  };
};

function buildAnnotationPayload(
  saved: DentalMeasurementExport,
  displaySetService: RestoreDisplaySetService
): RestoreAnnotationPayload | null {
  const coordinates = normalizeRestoreCoordinates(saved.coordinates ?? {});
  const points = coordinates.points;
  if (!hasValidRestorePoints(saved.tool || 'Length', points)) {
    return null;
  }

  const referencedImageId = resolveReferencedImageId(coordinates, displaySetService);
  if (!referencedImageId) {
    return null;
  }

  const annotationUID =
    saved.id && UUID_PATTERN.test(saved.id) ? saved.id : `dental-${utils.uuidv4()}`;

  return {
    uid: annotationUID,
    annotation: {
      annotationUID,
      data: {
        label: saved.label,
        handles: {
          points,
          activeHandleIndex: null,
          textBox: {
            hasMoved: false,
            worldPosition: points[Math.min(1, points.length - 1)] ?? points[0],
          },
        },
        cachedStats: {},
      },
      metadata: {
        toolName: saved.tool,
        referencedImageId,
        FrameOfReferenceUID:
          typeof coordinates.frameOfReferenceUID === 'string'
            ? coordinates.frameOfReferenceUID
            : undefined,
      },
    },
  };
}

function addCornerstoneAnnotation(
  payload: RestoreAnnotationPayload,
  saved: DentalMeasurementExport
): void {
  const coordinates = saved.coordinates ?? {};
  const isLocked = coordinates.is_locked === true;
  const isVisible = coordinates.is_visible !== false;

  const newAnnotation = {
    annotationUID: payload.uid,
    highlighted: false,
    isLocked,
    invalidated: true,
    metadata: {
      toolName: payload.annotation.metadata.toolName,
      FrameOfReferenceUID: payload.annotation.metadata.FrameOfReferenceUID,
      referencedImageId: payload.annotation.metadata.referencedImageId,
    },
    data: {
      label: payload.annotation.data.label,
      handles: { ...payload.annotation.data.handles },
      cachedStats: { ...payload.annotation.data.cachedStats },
    },
  };

  annotation.state.getAnnotationManager().addAnnotation(newAnnotation);
  annotation.locking.setAnnotationLocked(payload.uid, isLocked);
  annotation.visibility.setAnnotationVisibility(payload.uid, isVisible);
}

function syncAnnotationLabel(
  uid: string,
  label: string,
  servicesManager: AppTypes.ServicesManager
): void {
  const existingAnnotation = annotation.state.getAnnotation(uid);
  if (!existingAnnotation?.data) {
    return;
  }

  existingAnnotation.data.label = label;

  const { cornerstoneViewportService } = servicesManager.services as {
    cornerstoneViewportService?: {
      getRenderingEngine: () => { getViewports: () => Array<{ id: string }> } | null;
    };
  };
  const renderingEngine = cornerstoneViewportService?.getRenderingEngine?.();
  renderingEngine?.render();
}

function applySavedMeasurementMetadata(
  measurementService: {
    getMeasurement: (uid: string) => Record<string, unknown> | undefined;
    update: (uid: string, measurement: Record<string, unknown>, sync?: boolean) => void;
  },
  servicesManager: AppTypes.ServicesManager,
  uid: string,
  saved: DentalMeasurementExport
): void {
  const presetId = saved.dental_preset_id;
  const label = String(saved.label ?? '').trim();

  if (presetId) {
    rememberDentalPresetForMeasurement(uid, presetId);
  }

  if (label) {
    rememberDentalMeasurementLabel(uid, label);
  }

  const current = measurementService.getMeasurement(uid);
  if (!current) {
    return;
  }

  measurementService.update(
    uid,
    {
      ...current,
      label: label || getDentalMeasurementLabel(uid) || current.label,
      unit: saved.unit,
      ...(presetId ? { dentalPresetId: presetId } : {}),
      isLocked: saved.coordinates?.is_locked === true,
      isVisible: saved.coordinates?.is_visible !== false,
    },
    true
  );

  if (label) {
    syncAnnotationLabel(uid, label, servicesManager);
  }
}

function requestMeasurementViewportRender(servicesManager: AppTypes.ServicesManager): void {
  const { cornerstoneViewportService } = servicesManager.services as {
    cornerstoneViewportService?: { getRenderingEngine: () => { render: () => void } | null };
  };

  const renderingEngine = cornerstoneViewportService?.getRenderingEngine?.();
  renderingEngine?.render();
}

export function liveMeasurementToDisplayItem(
  measurement: Record<string, unknown>
): Record<string, unknown> {
  const uid = String(measurement.uid ?? '');
  const dentalPresetId =
    (measurement as { dentalPresetId?: string }).dentalPresetId ??
    getDentalPresetForMeasurement(uid) ??
    resolveDentalPresetId({
      dentalPresetId: (measurement as { dentalPresetId?: string }).dentalPresetId,
      label: measurement.label,
      toolName: measurement.toolName,
      type: measurement.type,
      unit: (measurement as { unit?: string }).unit,
    });

  return {
    ...measurement,
    uid,
    label: resolveDentalMeasurementLabel({
      ...measurement,
      uid,
      dentalPresetId,
    }),
    ...(dentalPresetId ? { dentalPresetId } : {}),
  };
}

export function serverMeasurementToDisplayItem(
  saved: DentalMeasurementExport,
  displaySetService: RestoreDisplaySetService,
  index = 0
): Record<string, unknown> {
  const coordinates = normalizeRestoreCoordinates(saved.coordinates ?? {});
  const displaySets = displaySetService.getActiveDisplaySets();
  const displaySetInstanceUID =
    (coordinates.displaySetInstanceUID as string | undefined) ??
    displaySets[0]?.displaySetInstanceUID;

  const uid =
    saved.id && UUID_PATTERN.test(saved.id)
      ? saved.id
      : getServerMeasurementUid(saved, index);

  if (saved.label) {
    rememberDentalMeasurementLabel(uid, saved.label);
  }
  if (saved.dental_preset_id) {
    rememberDentalPresetForMeasurement(uid, saved.dental_preset_id);
  }

  return {
    uid,
    label: resolveDentalMeasurementLabel({
      label: saved.label,
      toolName: saved.tool,
      dentalPresetId: saved.dental_preset_id,
      dental_preset_id: saved.dental_preset_id,
      uid,
    }),
    unit: saved.unit,
    toolName: saved.tool,
    type: saved.tool,
    dentalPresetId: saved.dental_preset_id,
    displayText: {
      primary: [saved.value],
      secondary: [],
    },
    displaySetInstanceUID,
    referenceSeriesUID:
      resolveSavedMeasurementSeriesId(saved) ??
      (coordinates.referenceSeriesUID as string | undefined),
    SOPInstanceUID: coordinates.SOPInstanceUID,
    FrameOfReferenceUID: coordinates.frameOfReferenceUID,
    createdAt: Date.parse(saved.captured_at) || Date.now(),
    isVisible: coordinates.is_visible !== false,
    isLocked: coordinates.is_locked === true,
    isServerRestored: true,
  };
}

export function restoreDentalMeasurements(
  servicesManager: AppTypes.ServicesManager,
  serverMeasurements: DentalMeasurementExport[],
  options?: { seriesIds?: string[] }
): number {
  const measurementsToRestore =
    options?.seriesIds?.length
      ? serverMeasurements.filter(saved =>
          measurementMatchesActiveSeries(
            resolveSavedMeasurementSeriesId(saved),
            options.seriesIds!
          )
        )
      : serverMeasurements;

  if (!measurementsToRestore.length) {
    return 0;
  }

  const { measurementService, displaySetService } = servicesManager.services;
  const source = measurementService.getSource(
    CORNERSTONE_3D_TOOLS_SOURCE_NAME,
    CORNERSTONE_3D_TOOLS_SOURCE_VERSION
  );

  if (!source) {
    return 0;
  }

  const mappings = measurementService.getSourceMappings(
    CORNERSTONE_3D_TOOLS_SOURCE_NAME,
    CORNERSTONE_3D_TOOLS_SOURCE_VERSION
  );

  let restored = 0;

  measurementsToRestore.forEach(saved => {
    const annotationType = saved.tool || 'Length';
    if (!SUPPORTED_RESTORE_TOOLS.has(annotationType)) {
      return;
    }

    const mapping = mappings.find(entry => entry.annotationType === annotationType);
    if (!mapping) {
      return;
    }

    const payload = buildAnnotationPayload(saved, displaySetService);
    if (!payload) {
      return;
    }

    const uid = payload.uid;
    const existingAnnotation = annotation.state.getAnnotation(uid);
    const existingMeasurement = measurementService.getMeasurement(uid);
    const coordinates = saved.coordinates ?? {};
    const isVisible = coordinates.is_visible !== false;
    const isLocked = coordinates.is_locked === true;

    if (existingAnnotation) {
      if (saved.label) {
        existingAnnotation.data.label = saved.label;
      }
      annotation.locking.setAnnotationLocked(uid, isLocked);
      annotation.visibility.setAnnotationVisibility(uid, isVisible);
      applySavedMeasurementMetadata(measurementService, servicesManager, uid, saved);
      restored += 1;
      return;
    }

    if (existingMeasurement) {
      addCornerstoneAnnotation(payload, saved);
      applySavedMeasurementMetadata(measurementService, servicesManager, uid, saved);
      restored += 1;
      return;
    }

    const addedUid = measurementService.addRawMeasurement(
      source,
      annotationType,
      payload,
      mapping.toMeasurementSchema
    );

    if (addedUid) {
      applySavedMeasurementMetadata(
        measurementService,
        servicesManager,
        String(addedUid),
        saved
      );
      restored += 1;
    }
  });

  if (restored > 0) {
    requestMeasurementViewportRender(servicesManager);
  }

  return restored;
}
