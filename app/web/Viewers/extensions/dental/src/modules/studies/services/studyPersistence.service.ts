/**
 * Study-level persistence cache — coordinates parallel viewer-state + measurement loads.
 */
import type { DentalMeasurementExport } from '../../measurements/types/measurement.types';
import { fetchViewerState } from '../../viewer/services/viewerStateApi';
import {
  fetchMeasurementsFromServer,
} from '../../measurements/services/measurementsApi';

const LOAD_FETCH_OPTIONS = { redirectOnUnauthorized: false as const };

const studyLoadCache = new Map<
  string,
  Promise<{
    viewerState: Awaited<ReturnType<typeof fetchViewerState>>;
    serverMeasurements: DentalMeasurementExport[];
  }>
>();

export function getStudyLoadCache(
  studyInstanceUID: string
): Promise<{
  viewerState: Awaited<ReturnType<typeof fetchViewerState>>;
  serverMeasurements: DentalMeasurementExport[];
}> | undefined {
  return studyLoadCache.get(studyInstanceUID);
}

export function setStudyLoadCache(
  studyInstanceUID: string,
  promise: Promise<{
    viewerState: Awaited<ReturnType<typeof fetchViewerState>>;
    serverMeasurements: DentalMeasurementExport[];
  }>
): void {
  studyLoadCache.set(studyInstanceUID, promise);
}

export function clearStudyLoadCache(studyInstanceUID?: string): void {
  if (studyInstanceUID) {
    studyLoadCache.delete(studyInstanceUID);
    return;
  }
  studyLoadCache.clear();
}

export async function fetchStudyPersistenceBundle(studyInstanceUID: string): Promise<{
  viewerState: Awaited<ReturnType<typeof fetchViewerState>>;
  serverMeasurements: DentalMeasurementExport[];
}> {
  const [viewerState, studyMeasurements] = await Promise.all([
    fetchViewerState(studyInstanceUID, LOAD_FETCH_OPTIONS),
    fetchMeasurementsFromServer(studyInstanceUID, undefined, LOAD_FETCH_OPTIONS),
  ]);

  const viewer_state_id = viewerState?.id ?? null;
  const measurements = viewer_state_id
    ? await fetchMeasurementsFromServer(studyInstanceUID, viewer_state_id, LOAD_FETCH_OPTIONS)
    : studyMeasurements;

  return {
    viewerState,
    serverMeasurements: measurements.length > 0 ? measurements : studyMeasurements,
  };
}
