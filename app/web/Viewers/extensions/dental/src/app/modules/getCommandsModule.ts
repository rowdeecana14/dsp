import { Types } from '@ohif/core';
import {
  getActiveDentalPreset,
  clearActiveDentalPreset,
  resolveDentalMeasurementLabel,
  resolveDentalPresetId,
  rememberDentalPresetForMeasurement,
  getDentalPresetForMeasurement,
  forgetDentalPresetForMeasurement,
  rememberDentalMeasurementLabel,
  getDentalMeasurementLabel,
  DENTAL_MEASUREMENT_PRESETS,
  clearDentalMeasurementMemory,
  useDentalStore,
} from '../../modules/dental';
import {
  downloadMeasurementsJson,
  saveMeasurementsToServer,
} from '../../modules/measurements';
import {
  getActiveStudyInstanceUID,
  getMeasurementsForExport,
} from '../../modules/measurements';
import { hasAuthToken } from '../../modules/viewer';
import {
  resetDentalStudyPersistence,
} from '../../modules/measurements';
import {
  scheduleDentalMeasurementAutoSave,
  cancelDentalMeasurementAutoSave,
  flushDentalMeasurementAutoSave,
} from '../../modules/measurements';
import {
  cancelDentalViewerStateAutoSave,
  flushDentalViewerStateAutoSave,
} from '../../modules/viewer';
import { useMeasurementStore } from '../../modules/measurements';
import { useViewerStore } from '../../modules/viewer';

export default function getCommandsModule({
  servicesManager,
}: Types.Extensions.ExtensionParams): Types.Extensions.CommandsModule {
  const { measurementService, displaySetService } = servicesManager.services;

  let measurementAddedUnsub: (() => void) | undefined;
  let measurementUpdatedUnsub: (() => void) | undefined;
  let measurementRemovedUnsub: (() => void) | undefined;

  const scheduleAutoSave = () => {
    const studyInstanceUID = getActiveStudyInstanceUID(displaySetService);
    if (studyInstanceUID) {
      scheduleDentalMeasurementAutoSave(studyInstanceUID, servicesManager);
    }
  };

  const applyDentalPresetToMeasurement = (
    measurement: Record<string, unknown>,
    presetId: string | undefined
  ) => {
    if (!measurement?.uid) {
      return;
    }

    const uid = String(measurement.uid);
    const resolvedPresetId =
      presetId ??
      (measurement as { dentalPresetId?: string }).dentalPresetId ??
      getDentalPresetForMeasurement(uid) ??
      resolveDentalPresetId({
        dentalPresetId: (measurement as { dentalPresetId?: string }).dentalPresetId,
        label: measurement.label,
        toolName: measurement.toolName,
        type: measurement.type,
        unit: (measurement as { unit?: string }).unit,
      });

    const label =
      String(measurement.label ?? '').trim() ||
      getDentalMeasurementLabel(uid) ||
      resolveDentalMeasurementLabel({
        ...measurement,
        uid,
        dentalPresetId: resolvedPresetId,
      });
    const trimmedUnit = String((measurement as { unit?: string }).unit ?? '').trim();
    const preset = resolvedPresetId
      ? DENTAL_MEASUREMENT_PRESETS.find(item => item.id === resolvedPresetId)
      : undefined;
    const unit = preset?.unit ?? (trimmedUnit || 'mm');

    if (resolvedPresetId) {
      rememberDentalPresetForMeasurement(uid, resolvedPresetId);
    }
    rememberDentalMeasurementLabel(uid, label);

    measurementService.update(
      uid,
      {
        ...measurement,
        label,
        unit,
        ...(resolvedPresetId ? { dentalPresetId: resolvedPresetId } : {}),
      },
      true
    );
  };

  const actions = {
    initDentalMeasurementLabeling: () => {
      if (measurementAddedUnsub) {
        return;
      }
      const { MEASUREMENT_ADDED } = measurementService.EVENTS;
      const sub = measurementService.subscribe(MEASUREMENT_ADDED, ({ measurement }) => {
        if (!measurement?.uid) {
          return;
        }
        const preset = getActiveDentalPreset();
        const presetId =
          preset?.id ??
          (measurement as { dentalPresetId?: string }).dentalPresetId ??
          resolveDentalPresetId({
            dentalPresetId: (measurement as { dentalPresetId?: string }).dentalPresetId,
            label: measurement.label,
            toolName: measurement.toolName,
            type: measurement.type,
            unit: (measurement as { unit?: string }).unit,
          });

        applyDentalPresetToMeasurement(measurement, presetId);
        scheduleAutoSave();

        if (preset) {
          clearActiveDentalPreset();
        }
      });
      measurementAddedUnsub = sub.unsubscribe;

      const updatedSub = measurementService.subscribe(
        measurementService.EVENTS.MEASUREMENT_UPDATED,
        ({ measurement, notYetUpdatedAtSource }) => {
          if (!measurement?.uid || notYetUpdatedAtSource) {
            return;
          }

          const presetId =
            (measurement as { dentalPresetId?: string }).dentalPresetId ??
            getDentalPresetForMeasurement(String(measurement.uid)) ??
            resolveDentalPresetId({
              dentalPresetId: (measurement as { dentalPresetId?: string }).dentalPresetId,
              label: measurement.label,
              toolName: measurement.toolName,
              type: measurement.type,
              unit: (measurement as { unit?: string }).unit,
            });

          if (!presetId) {
            return;
          }

          const currentLabel = String(measurement.label ?? '').trim();
          const rememberedLabel = getDentalMeasurementLabel(String(measurement.uid));
          const hasPresetOnMeasurement = !!(measurement as { dentalPresetId?: string })
            .dentalPresetId;

          if (hasPresetOnMeasurement && currentLabel) {
            return;
          }

          if (!currentLabel && rememberedLabel) {
            measurementService.update(
              String(measurement.uid),
              {
                ...measurement,
                label: rememberedLabel,
                dentalPresetId: presetId,
              },
              true
            );
            return;
          }

          applyDentalPresetToMeasurement(measurement, presetId);
          scheduleAutoSave();
        }
      );
      measurementUpdatedUnsub = updatedSub.unsubscribe;

      const removedSub = measurementService.subscribe(
        measurementService.EVENTS.MEASUREMENT_REMOVED,
        ({ measurement }) => {
          forgetDentalPresetForMeasurement(measurement?.uid);
          scheduleAutoSave();
        }
      );
      measurementRemovedUnsub = removedSub.unsubscribe;
    },

    exportDentalMeasurements: () => {
      const studyInstanceUID =
        getActiveStudyInstanceUID(displaySetService) ?? 'unknown';
      const measurements = getMeasurementsForExport(measurementService);
      downloadMeasurementsJson(studyInstanceUID, measurements);
    },

    saveDentalMeasurements: async () => {
      if (!hasAuthToken()) {
        return false;
      }
      const studyInstanceUID = getActiveStudyInstanceUID(displaySetService);
      if (!studyInstanceUID) {
        return false;
      }
      const measurements = getMeasurementsForExport(measurementService);
      return saveMeasurementsToServer(studyInstanceUID, measurements);
    },

    destroyDentalViewerSync: () => {
      measurementAddedUnsub?.();
      measurementUpdatedUnsub?.();
      measurementRemovedUnsub?.();
      measurementAddedUnsub = undefined;
      measurementUpdatedUnsub = undefined;
      measurementRemovedUnsub = undefined;

      clearDentalMeasurementMemory();
      clearActiveDentalPreset();
      flushDentalMeasurementAutoSave();
      flushDentalViewerStateAutoSave();
      cancelDentalMeasurementAutoSave();
      cancelDentalViewerStateAutoSave();
      resetDentalStudyPersistence();
      useMeasurementStore.getState().reset();
      useViewerStore.getState().reset();
      useDentalStore.getState().reset();
      measurementService.clearMeasurements();
    },
  };

  const definitions = {
    initDentalMeasurementLabeling: {
      commandFn: actions.initDentalMeasurementLabeling,
    },
    destroyDentalViewerSync: {
      commandFn: actions.destroyDentalViewerSync,
    },
    exportDentalMeasurements: {
      commandFn: actions.exportDentalMeasurements,
    },
    saveDentalMeasurements: {
      commandFn: actions.saveDentalMeasurements,
    },
  };

  return {
    actions,
    definitions,
    defaultContext: 'DEFAULT',
  };
}
