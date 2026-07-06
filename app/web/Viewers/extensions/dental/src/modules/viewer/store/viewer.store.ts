import { create } from 'zustand';
import type { SyncStatus } from '../../../shared/types';
import type { ViewerStateRecord } from '../../measurements/types/measurement.types';

interface ViewerStoreState {
  studyInstanceUID: string | null;
  syncStatus: SyncStatus;
  loadedViewerState: ViewerStateRecord | null;
  viewerStateId: string | null;
  setStudyInstanceUID: (uid: string | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setLoadedViewerState: (state: ViewerStateRecord | null) => void;
  setViewerStateId: (id: string | null) => void;
  applyRestoredState: (ui: {
    selectedTooth: string;
    toothSystem: import('../../../shared/utils/toothNumbering').ToothSystem;
  }) => void;
  reset: () => void;
}

const initialState = {
  studyInstanceUID: null,
  syncStatus: 'idle' as SyncStatus,
  loadedViewerState: null,
  viewerStateId: null,
};

export const useViewerStore = create<ViewerStoreState>(set => ({
  ...initialState,

  setStudyInstanceUID: studyInstanceUID => set({ studyInstanceUID }),
  setSyncStatus: syncStatus => set({ syncStatus }),
  setLoadedViewerState: loadedViewerState => set({ loadedViewerState }),
  setViewerStateId: viewerStateId => set({ viewerStateId }),

  applyRestoredState: () => {
    // UI restore is handled by dental hooks; store tracks server state only
  },

  reset: () => set({ ...initialState }),
}));
