import { useViewerStore } from '../store/viewer.store';

/** Read viewer UI persistence state from the module store. */
export function useViewerState() {
  const studyInstanceUID = useViewerStore(state => state.studyInstanceUID);
  const syncStatus = useViewerStore(state => state.syncStatus);
  const loadedViewerState = useViewerStore(state => state.loadedViewerState);
  const viewerStateId = useViewerStore(state => state.viewerStateId);

  return {
    studyInstanceUID,
    syncStatus,
    loadedViewerState,
    viewerStateId,
  };
}
