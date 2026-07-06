import { useCallback, useEffect } from 'react';
import { useSystem } from '@ohif/core';
import { useDentalViewportContext } from '../../viewer';
import { hasAuthToken } from '../../viewer';
import {
  scheduleDentalMeasurementAutoSave,
  cancelDentalMeasurementAutoSave,
  flushDentalMeasurementAutoSave,
} from '../services/dentalMeasurementAutoSave';

/** Debounced auto-save orchestration for live OHIF measurements. */
export function useMeasurementSync() {
  const { servicesManager } = useSystem();
  const { studyInstanceUID } = useDentalViewportContext();

  const scheduleAutoSave = useCallback(() => {
    if (!hasAuthToken() || !studyInstanceUID) {
      return;
    }
    scheduleDentalMeasurementAutoSave(studyInstanceUID, servicesManager);
  }, [studyInstanceUID, servicesManager]);

  useEffect(() => () => cancelDentalMeasurementAutoSave(), []);

  return {
    scheduleAutoSave,
    flushAutoSave: flushDentalMeasurementAutoSave,
    cancelAutoSave: cancelDentalMeasurementAutoSave,
  };
}
