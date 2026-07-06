import { useEffect, useRef } from 'react';
import { useSystem } from '@ohif/core';
import {
  getActiveStudyInstanceUID,
  getFocusedSeriesInstanceUIDs,
  isDentalStudyDisplayReady,
  getDentalPersistenceState,
  loadDentalStudyPersistence,
  refreshDentalStudyPersistence,
  markDentalMeasurementsSynced,
  restoreDentalMeasurements,
} from '../../measurements';
import {
  hasAuthToken,
  restoreDentalViewerState,
  useDentalViewportContext,
} from '../../viewer';

export function useStudySync() {
  const { commandsManager } = useSystem();
  const { contextKey, servicesManager, displaySetService, viewportGridService } =
    useDentalViewportContext();
  const lastContextKeyRef = useRef('');
  const lastRestoredStudyRef = useRef<string | null>(null);

  useEffect(() => {
    commandsManager.runCommand('initDentalMeasurementLabeling', {}, 'DEFAULT');
  }, [commandsManager]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const restoreFocusedMeasurements = () => {
      if (cancelled) {
        return;
      }

      const studyInstanceUID = getActiveStudyInstanceUID(displaySetService);
      if (!studyInstanceUID || !hasAuthToken()) {
        return;
      }

      if (!isDentalStudyDisplayReady(displaySetService, studyInstanceUID)) {
        return;
      }

      const focusedSeriesIds = getFocusedSeriesInstanceUIDs(
        displaySetService,
        viewportGridService
      );
      const { serverMeasurements, loaded_study_instance_uid } = getDentalPersistenceState();

      if (loaded_study_instance_uid === studyInstanceUID) {
        restoreDentalMeasurements(servicesManager, serverMeasurements, {
          seriesIds: focusedSeriesIds,
        });
        markDentalMeasurementsSynced(servicesManager);
      }
    };

    const syncStudy = async () => {
      const studyInstanceUID = getActiveStudyInstanceUID(displaySetService);
      if (!studyInstanceUID || !hasAuthToken()) {
        return;
      }

      if (!isDentalStudyDisplayReady(displaySetService, studyInstanceUID)) {
        return;
      }

      const contextChanged =
        !!lastContextKeyRef.current && lastContextKeyRef.current !== contextKey;
      lastContextKeyRef.current = contextKey;

      const { viewerState } = contextChanged
        ? await refreshDentalStudyPersistence(studyInstanceUID)
        : await loadDentalStudyPersistence(studyInstanceUID);

      if (cancelled) {
        return;
      }

      if (viewerState && lastRestoredStudyRef.current !== studyInstanceUID) {
        restoreDentalViewerState(servicesManager, commandsManager, viewerState);
        lastRestoredStudyRef.current = studyInstanceUID;
      }

      restoreFocusedMeasurements();

      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      retryTimer = setTimeout(restoreFocusedMeasurements, 600);
    };

    syncStudy();

    const addedSub = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_ADDED,
      () => {
        void syncStudy();
        restoreFocusedMeasurements();
      }
    );

    const changedSub = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_CHANGED,
      () => {
        void syncStudy();
      }
    );

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      addedSub.unsubscribe();
      changedSub.unsubscribe();
    };
  }, [contextKey, displaySetService, viewportGridService, servicesManager, commandsManager]);
}
