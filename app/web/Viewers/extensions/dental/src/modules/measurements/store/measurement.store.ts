import { create } from 'zustand';
import type { SyncStatus } from '../../../shared/types';
import type { DentalMeasurementExport, ViewerStateRecord } from '../types/measurement.types';

export const DENTAL_MEASUREMENTS_DEFAULT_PAGE_SIZE = 10;

export type MeasurementPanelSortField = 'label' | 'value' | 'date';

export type MeasurementPanelUiState = {
  filterText: string;
  presetFilter: string;
  sortField: MeasurementPanelSortField;
  sortAsc: boolean;
  page: number;
  pageSize: number;
  selectedUids: Set<string>;
  filtersExpanded: boolean;
};

export function createDefaultPanelUiState(): MeasurementPanelUiState {
  return {
    filterText: '',
    presetFilter: 'all',
    sortField: 'label',
    sortAsc: true,
    page: 1,
    pageSize: DENTAL_MEASUREMENTS_DEFAULT_PAGE_SIZE,
    selectedUids: new Set(),
    filtersExpanded: false,
  };
}

const DEFAULT_PANEL_UI_STATE = createDefaultPanelUiState();

export function getPanelUiState(
  panelStateByStudy: Record<string, MeasurementPanelUiState>,
  studyInstanceUID: string | null | undefined
): MeasurementPanelUiState {
  if (!studyInstanceUID) {
    return DEFAULT_PANEL_UI_STATE;
  }
  return panelStateByStudy[studyInstanceUID] ?? DEFAULT_PANEL_UI_STATE;
}

function patchStudyPanelState(
  panelStateByStudy: Record<string, MeasurementPanelUiState>,
  studyInstanceUID: string,
  patch: Partial<MeasurementPanelUiState>
): Record<string, MeasurementPanelUiState> {
  const current = panelStateByStudy[studyInstanceUID] ?? createDefaultPanelUiState();

  return {
    ...panelStateByStudy,
    [studyInstanceUID]: {
      ...current,
      ...patch,
      selectedUids: patch.selectedUids
        ? new Set(patch.selectedUids)
        : new Set(current.selectedUids),
    },
  };
}

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
  panelStateByStudy: Record<string, MeasurementPanelUiState>;
  patchPersistence: (patch: Partial<MeasurementPersistenceState>) => void;
  setFilterText: (studyInstanceUID: string, filterText: string) => void;
  setPresetFilter: (studyInstanceUID: string, presetFilter: string) => void;
  setSortField: (studyInstanceUID: string, field: MeasurementPanelSortField) => void;
  setSortAsc: (studyInstanceUID: string, sortAsc: boolean) => void;
  setPage: (studyInstanceUID: string, page: number) => void;
  setPageSize: (studyInstanceUID: string, pageSize: number) => void;
  setSelectedUids: (studyInstanceUID: string, selectedUids: Set<string>) => void;
  toggleSelectedUid: (studyInstanceUID: string, uid: string, checked: boolean) => void;
  setFiltersExpanded: (studyInstanceUID: string, filtersExpanded: boolean) => void;
  reset: () => void;
}

export const useMeasurementStore = create<MeasurementStoreState>(set => ({
  ...initialPersistenceState,
  panelStateByStudy: {},

  patchPersistence: patch =>
    set(state => ({
      ...state,
      ...patch,
    })),

  setFilterText: (studyInstanceUID, filterText) =>
    set(state => ({
      panelStateByStudy: patchStudyPanelState(state.panelStateByStudy, studyInstanceUID, {
        filterText,
      }),
    })),

  setPresetFilter: (studyInstanceUID, presetFilter) =>
    set(state => ({
      panelStateByStudy: patchStudyPanelState(state.panelStateByStudy, studyInstanceUID, {
        presetFilter,
      }),
    })),

  setSortField: (studyInstanceUID, sortField) =>
    set(state => ({
      panelStateByStudy: patchStudyPanelState(state.panelStateByStudy, studyInstanceUID, {
        sortField,
      }),
    })),

  setSortAsc: (studyInstanceUID, sortAsc) =>
    set(state => ({
      panelStateByStudy: patchStudyPanelState(state.panelStateByStudy, studyInstanceUID, {
        sortAsc,
      }),
    })),

  setPage: (studyInstanceUID, page) =>
    set(state => ({
      panelStateByStudy: patchStudyPanelState(state.panelStateByStudy, studyInstanceUID, { page }),
    })),

  setPageSize: (studyInstanceUID, pageSize) =>
    set(state => ({
      panelStateByStudy: patchStudyPanelState(state.panelStateByStudy, studyInstanceUID, {
        pageSize,
      }),
    })),

  setSelectedUids: (studyInstanceUID, selectedUids) =>
    set(state => ({
      panelStateByStudy: patchStudyPanelState(state.panelStateByStudy, studyInstanceUID, {
        selectedUids,
      }),
    })),

  toggleSelectedUid: (studyInstanceUID, uid, checked) =>
    set(state => {
      const current = state.panelStateByStudy[studyInstanceUID] ?? createDefaultPanelUiState();
      const selectedUids = new Set(current.selectedUids);
      if (checked) {
        selectedUids.add(uid);
      } else {
        selectedUids.delete(uid);
      }
      return {
        panelStateByStudy: patchStudyPanelState(state.panelStateByStudy, studyInstanceUID, {
          selectedUids,
        }),
      };
    }),

  setFiltersExpanded: (studyInstanceUID, filtersExpanded) =>
    set(state => ({
      panelStateByStudy: patchStudyPanelState(state.panelStateByStudy, studyInstanceUID, {
        filtersExpanded,
      }),
    })),

  reset: () =>
    set({
      ...initialPersistenceState,
      panelStateByStudy: {},
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
