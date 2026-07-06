import {
  saveViewerState,
  ViewerStatePayload,
  ViewerStateRecord,
  hasAuthToken,
} from '../../viewer/services/viewerStateApi';
import {
  saveMeasurementsToServer,
  DentalMeasurementExport,
} from './measurementsApi';
import {
  getAllDentalMeasurementsForSave,
  computeMeasurementsSaveFingerprint,
} from './dentalApiMappers';
import type { ToothSystem } from '../../../shared/utils/toothNumbering';
import {
  useMeasurementStore,
  getDentalPersistenceState,
  subscribeDentalPersistence,
  type MeasurementPersistenceState,
} from '../store/measurement.store';
import type { SyncStatus } from '../../../shared/types';
import { useViewerStore } from '../../viewer/store/viewer.store';
import {
  clearStudyLoadCache,
  fetchStudyPersistenceBundle,
  getStudyLoadCache,
  setStudyLoadCache,
} from '../../studies/services/studyPersistence.service';

function patchPersistence(patch: Partial<MeasurementPersistenceState>) {
  useMeasurementStore.getState().patchPersistence(patch);

  const viewerPatch: Partial<{
    studyInstanceUID: string | null;
    syncStatus: SyncStatus;
    loadedViewerState: MeasurementPersistenceState['loadedViewerState'];
    viewerStateId: string | null;
  }> = {};

  if ('loaded_study_instance_uid' in patch) {
    viewerPatch.studyInstanceUID = patch.loaded_study_instance_uid ?? null;
  }
  if ('syncStatus' in patch && patch.syncStatus) {
    viewerPatch.syncStatus = patch.syncStatus;
  }
  if ('loadedViewerState' in patch) {
    viewerPatch.loadedViewerState = patch.loadedViewerState ?? null;
  }
  if ('viewer_state_id' in patch) {
    viewerPatch.viewerStateId = patch.viewer_state_id ?? null;
  }

  if (Object.keys(viewerPatch).length > 0) {
    useViewerStore.setState(viewerPatch);
  }
}

export { subscribeDentalPersistence, getDentalPersistenceState };
export type { MeasurementPersistenceState as DentalPersistenceState, SyncStatus, ToothSystem, ViewerStateRecord };

export function getDentalViewerStateId(): string | null {
  return useMeasurementStore.getState().viewer_state_id;
}

export function getLoadedViewerState(): ViewerStateRecord | null {
  return useMeasurementStore.getState().loadedViewerState;
}

export function setDentalViewerStateId(viewer_state_id: string | null): void {
  patchPersistence({ viewer_state_id });
}

export function updateDentalServerMeasurements(
  serverMeasurements: DentalMeasurementExport[]
): void {
  patchPersistence({
    serverMeasurements,
    serverMeasurementCount: serverMeasurements.length,
  });
}

export function getServerMeasurementUid(
  saved: DentalMeasurementExport,
  index = 0
): string {
  return (
    saved.id ??
    `server-${saved.captured_at}-${saved.label}-${index}`
  );
}

function findServerMeasurementIndex(uid: string): number {
  const { serverMeasurements } = useMeasurementStore.getState();
  return serverMeasurements.findIndex((saved, index) => {
    const itemUid = getServerMeasurementUid(saved, index);
    return itemUid === uid || saved.id === uid;
  });
}

export function updateServerMeasurement(
  uid: string,
  updater: (saved: DentalMeasurementExport) => DentalMeasurementExport
): boolean {
  const index = findServerMeasurementIndex(uid);
  if (index < 0) {
    return false;
  }

  const { serverMeasurements } = useMeasurementStore.getState();
  const next = [...serverMeasurements];
  next[index] = updater(next[index]);
  patchPersistence({
    serverMeasurements: next,
    serverMeasurementCount: next.length,
  });
  return true;
}

export function removeServerMeasurement(uid: string): void {
  const { serverMeasurements } = useMeasurementStore.getState();
  const next = serverMeasurements.filter((saved, index) => {
    const itemUid = getServerMeasurementUid(saved, index);
    return itemUid !== uid && saved.id !== uid;
  });
  patchPersistence({
    serverMeasurements: next,
    serverMeasurementCount: next.length,
  });
}

async function saveAllDentalMeasurements(
  studyInstanceUID: string,
  servicesManager: AppTypes.ServicesManager
): Promise<boolean> {
  const { measurementService, viewportGridService } = servicesManager.services;
  const state = useMeasurementStore.getState();
  const viewer_state_id = state.viewer_state_id;

  const measurements = getAllDentalMeasurementsForSave(
    measurementService,
    state.serverMeasurements,
    {
      viewer_state_id: viewer_state_id ?? undefined,
      viewportGridService,
    }
  ).map(measurement => ({
    ...measurement,
    ...(viewer_state_id ? { viewer_state_id } : {}),
  }));

  const fingerprint = computeMeasurementsSaveFingerprint(measurements);
  if (
    fingerprint === state.syncedSaveFingerprint ||
    (measurements.length === 0 && state.serverMeasurementCount === 0)
  ) {
    patchPersistence({
      syncStatus: 'synced',
      lastSyncedAt: Date.now(),
      serverMeasurementCount: 0,
      serverMeasurements: [],
      syncedSaveFingerprint: fingerprint,
      measurementsBaselineReady: true,
    });
    return true;
  }

  const ok = await saveMeasurementsToServer(studyInstanceUID, measurements);

  if (ok) {
    patchPersistence({
      syncStatus: 'synced',
      lastSyncedAt: Date.now(),
      serverMeasurementCount: measurements.length,
      serverMeasurements: measurements,
      syncedSaveFingerprint: computeMeasurementsSaveFingerprint(measurements),
      measurementsBaselineReady: true,
    });
  } else {
    patchPersistence({ syncStatus: 'error' });
  }

  return ok;
}

export async function loadDentalStudyPersistence(
  studyInstanceUID: string
): Promise<{
  viewerState: ViewerStateRecord | null;
  serverMeasurements: DentalMeasurementExport[];
}> {
  if (!hasAuthToken()) {
    patchPersistence({
      syncStatus: 'idle',
      syncedSaveFingerprint: computeMeasurementsSaveFingerprint([]),
      measurementsBaselineReady: true,
      viewer_state_id: null,
      loadedViewerState: null,
    });
    return { viewerState: null, serverMeasurements: [] };
  }

  const cached = getStudyLoadCache(studyInstanceUID);
  if (cached) {
    return cached;
  }

  const loadPromise = (async () => {
    patchPersistence({ syncStatus: 'syncing', measurementsBaselineReady: false });

    try {
      const { viewerState, serverMeasurements: resolvedMeasurements } =
        await fetchStudyPersistenceBundle(studyInstanceUID);

      const viewer_state_id = viewerState?.id ?? null;

      patchPersistence({
        syncStatus: 'synced',
        lastSyncedAt: Date.now(),
        serverMeasurementCount: resolvedMeasurements.length,
        serverMeasurements: resolvedMeasurements,
        loaded_study_instance_uid: studyInstanceUID,
        loadedViewerState: viewerState,
        viewer_state_id,
        syncedSaveFingerprint: computeMeasurementsSaveFingerprint(resolvedMeasurements),
        measurementsBaselineReady: false,
      });

      return { viewerState, serverMeasurements: resolvedMeasurements };
    } catch {
      patchPersistence({ syncStatus: 'error' });
      return { viewerState: null, serverMeasurements: [] };
    }
  })();

  setStudyLoadCache(studyInstanceUID, loadPromise);
  return loadPromise;
}

export async function refreshDentalStudyPersistence(
  studyInstanceUID: string
): Promise<{
  viewerState: ViewerStateRecord | null;
  serverMeasurements: DentalMeasurementExport[];
}> {
  clearStudyLoadCache(studyInstanceUID);
  return loadDentalStudyPersistence(studyInstanceUID);
}

export function resetDentalStudyPersistence(studyInstanceUID?: string): void {
  const state = useMeasurementStore.getState();

  if (studyInstanceUID) {
    clearStudyLoadCache(studyInstanceUID);
    if (state.loaded_study_instance_uid === studyInstanceUID) {
      patchPersistence({
        serverMeasurements: [],
        serverMeasurementCount: 0,
        loaded_study_instance_uid: null,
        loadedViewerState: null,
        viewer_state_id: null,
        syncedSaveFingerprint: null,
        measurementsBaselineReady: false,
      });
    }
    return;
  }

  clearStudyLoadCache();
  patchPersistence({
    serverMeasurements: [],
    serverMeasurementCount: 0,
    loaded_study_instance_uid: null,
    loadedViewerState: null,
    viewer_state_id: null,
    syncedSaveFingerprint: null,
    measurementsBaselineReady: false,
  });
}

export function markDentalMeasurementsSynced(
  servicesManager: AppTypes.ServicesManager
): void {
  const { measurementService } = servicesManager.services;
  const state = useMeasurementStore.getState();
  const aligned = getAllDentalMeasurementsForSave(
    measurementService,
    state.serverMeasurements,
    {
      viewer_state_id: state.viewer_state_id ?? undefined,
      viewportGridService: servicesManager.services.viewportGridService,
    }
  );

  patchPersistence({
    serverMeasurements: aligned,
    serverMeasurementCount: aligned.length,
    syncedSaveFingerprint: computeMeasurementsSaveFingerprint(aligned),
    measurementsBaselineReady: true,
  });
}

export async function persistDentalViewerState(payload: ViewerStatePayload): Promise<boolean> {
  if (!hasAuthToken()) {
    return false;
  }

  patchPersistence({ syncStatus: 'syncing' });

  const saved = await saveViewerState(payload);
  const state = useMeasurementStore.getState();

  if (saved) {
    patchPersistence({
      syncStatus: 'synced',
      lastSyncedAt: Date.now(),
      viewer_state_id: saved.id ?? state.viewer_state_id,
      loadedViewerState: saved,
    });
    return true;
  }

  patchPersistence({ syncStatus: 'error' });
  return false;
}

export async function persistDentalMeasurements(
  studyInstanceUID: string,
  servicesManager: AppTypes.ServicesManager
): Promise<boolean> {
  if (!hasAuthToken() || !studyInstanceUID) {
    return false;
  }

  patchPersistence({ syncStatus: 'syncing' });
  return saveAllDentalMeasurements(studyInstanceUID, servicesManager);
}
