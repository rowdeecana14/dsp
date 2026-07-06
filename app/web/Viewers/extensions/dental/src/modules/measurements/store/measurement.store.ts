import { create } from 'zustand';
import type { SyncStatus } from '../../../shared/types';
import type { DentalMeasurementExport, ViewerStateRecord } from '../types/measurement.types';

export type MeasurementPersistenceState = {
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  serverMeasurementCount: number;
  serverMeasurements: DentalMeasurementExport[];
  loaded_study_instance_uid: string | null;
  loadedViewerState: ViewerStateRecord | null;
  viewer_state_id: string | null;
  syncedSaveFingerprint: string | null;
  measurementsBaselineReady: boolean;
};

const initialPersistenceState: MeasurementPersistenceState = {
  syncStatus: 'idle',
  lastSyncedAt: null,
  serverMeasurementCount: 0,
  serverMeasurements: [],
  loaded_study_instance_uid: null,
  loadedViewerState: null,
  viewer_state_id: null,
  syncedSaveFingerprint: null,
  measurementsBaselineReady: false,
};

interface MeasurementStoreState extends MeasurementPersistenceState {
  // Panel UI state
  filterText: string;
  presetFilter: string;
  sortField: 'label' | 'value' | 'date';
  sortAsc: boolean;
  page: number;
  pageSize: number;
  selectedUids: Set<string>;
  filtersExpanded: boolean;
  patchPersistence: (patch: Partial<MeasurementPersistenceState>) => void;
  setFilterText: (text: string) => void;
  setPresetFilter: (filter: string) => void;
  setSortField: (field: 'label' | 'value' | 'date') => void;
  setSortAsc: (asc: boolean) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedUids: (uids: Set<string>) => void;
  setFiltersExpanded: (expanded: boolean) => void;
  reset: () => void;
}

export const useMeasurementStore = create<MeasurementStoreState>(set => ({
  ...initialPersistenceState,
  filterText: '',
  presetFilter: 'all',
  sortField: 'label',
  sortAsc: true,
  page: 1,
  pageSize: 25,
  selectedUids: new Set(),
  filtersExpanded: false,

  patchPersistence: patch =>
    set(state => ({
      ...state,
      ...patch,
    })),

  setFilterText: filterText => set({ filterText }),
  setPresetFilter: presetFilter => set({ presetFilter }),
  setSortField: sortField => set({ sortField }),
  setSortAsc: sortAsc => set({ sortAsc }),
  setPage: page => set({ page }),
  setPageSize: pageSize => set({ pageSize }),
  setSelectedUids: selectedUids => set({ selectedUids }),
  setFiltersExpanded: filtersExpanded => set({ filtersExpanded }),

  reset: () =>
    set({
      ...initialPersistenceState,
      filterText: '',
      presetFilter: 'all',
      sortField: 'label',
      sortAsc: true,
      page: 1,
      pageSize: 25,
      selectedUids: new Set(),
      filtersExpanded: false,
    }),
}));

/** Subscribe to persistence slice changes (replaces pub/sub singleton). */
export function subscribeDentalPersistence(
  listener: (state: MeasurementPersistenceState) => void
): () => void {
  return useMeasurementStore.subscribe(state => {
    listener({
      syncStatus: state.syncStatus,
      lastSyncedAt: state.lastSyncedAt,
      serverMeasurementCount: state.serverMeasurementCount,
      serverMeasurements: state.serverMeasurements,
      loaded_study_instance_uid: state.loaded_study_instance_uid,
      loadedViewerState: state.loadedViewerState,
      viewer_state_id: state.viewer_state_id,
      syncedSaveFingerprint: state.syncedSaveFingerprint,
      measurementsBaselineReady: state.measurementsBaselineReady,
    });
  });
}

export function getDentalPersistenceState(): MeasurementPersistenceState {
  const state = useMeasurementStore.getState();
  return {
    syncStatus: state.syncStatus,
    lastSyncedAt: state.lastSyncedAt,
    serverMeasurementCount: state.serverMeasurementCount,
    serverMeasurements: state.serverMeasurements,
    loaded_study_instance_uid: state.loaded_study_instance_uid,
    loadedViewerState: state.loadedViewerState,
    viewer_state_id: state.viewer_state_id,
    syncedSaveFingerprint: state.syncedSaveFingerprint,
    measurementsBaselineReady: state.measurementsBaselineReady,
  };
}

export type { SyncStatus };
