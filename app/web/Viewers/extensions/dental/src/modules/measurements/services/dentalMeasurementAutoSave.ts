import debounce from 'lodash.debounce';
import { persistDentalMeasurements } from './dentalPersistence';
import { hasAuthToken } from '../../viewer/services/viewerStateApi';

let debouncedAutoSave: ReturnType<typeof debounce> | null = null;
let pendingServicesManager: AppTypes.ServicesManager | null = null;
let pendingStudyInstanceUID: string | null = null;

function runAutoSave() {
  if (!hasAuthToken() || !pendingStudyInstanceUID || !pendingServicesManager) {
    return;
  }

  void persistDentalMeasurements(pendingStudyInstanceUID, pendingServicesManager);
}

export function scheduleDentalMeasurementAutoSave(
  studyInstanceUID: string,
  servicesManager: AppTypes.ServicesManager
): void {
  if (!hasAuthToken() || !studyInstanceUID) {
    return;
  }

  pendingStudyInstanceUID = studyInstanceUID;
  pendingServicesManager = servicesManager;

  if (!debouncedAutoSave) {
    debouncedAutoSave = debounce(runAutoSave, 1500);
  }

  debouncedAutoSave();
}

export function flushDentalMeasurementAutoSave(): void {
  debouncedAutoSave?.flush();
}

export function cancelDentalMeasurementAutoSave(): void {
  debouncedAutoSave?.cancel();
  pendingServicesManager = null;
  pendingStudyInstanceUID = null;
}
