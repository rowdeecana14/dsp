import { useCallback, useEffect, useRef, useState } from 'react';
import { useSystem } from '@ohif/core';
import { useActiveTheme } from '@ohif/ui-next';
import type { ToothSystem } from '../../../shared/utils/toothNumbering';
import { useDentalStore } from '../store/dental.store';
import { useViewerStore } from '../../viewer';
import {
  buildDentalViewerStatePayload,
  scheduleDentalViewerStateAutoSave,
  cancelDentalViewerStateAutoSave,
} from '../../viewer/services/dentalViewerStateSync';
import { useDentalViewerStateRestore } from '../../viewer/hooks/useDentalViewerStateRestore';

export function useToothSelector() {
  const { servicesManager } = useSystem();
  const { displaySetService, viewportGridService } = servicesManager.services;
  const { activeTheme } = useActiveTheme();

  const selectedTooth = useDentalStore(state => state.selectedTooth);
  const toothSystem = useDentalStore(state => state.toothSystem);
  const setSelectedTooth = useDentalStore(state => state.setSelectedTooth);
  const setToothSystem = useDentalStore(state => state.setToothSystem);

  const [studyInstanceUID, setStudyInstanceUID] = useState<string | null>(null);
  const setViewerStudy = useViewerStore(state => state.setStudyInstanceUID);
  const restoringRef = useRef(false);

  const handleViewerStateRestore = useCallback(
    (ui: { selectedTooth: string; toothSystem: ToothSystem }) => {
      restoringRef.current = true;
      setSelectedTooth(ui.selectedTooth);
      setToothSystem(ui.toothSystem);
      window.setTimeout(() => {
        restoringRef.current = false;
      }, 0);
    },
    [setSelectedTooth, setToothSystem]
  );

  useDentalViewerStateRestore({
    studyInstanceUID,
    onRestore: handleViewerStateRestore,
  });

  useEffect(() => {
    const updateStudy = () => {
      const sets = displaySetService.getActiveDisplaySets();
      const uid = sets[0]?.StudyInstanceUID;
      if (uid && uid !== studyInstanceUID) {
        setStudyInstanceUID(uid);
        setViewerStudy(uid);
      }
    };
    updateStudy();
    const { unsubscribe } = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_CHANGED,
      updateStudy
    );
    return () => unsubscribe();
  }, [displaySetService, studyInstanceUID, setViewerStudy]);

  const persistState = useCallback(
    (tooth: string, system: ToothSystem, theme: string) => {
      if (!studyInstanceUID || restoringRef.current) {
        return;
      }

      scheduleDentalViewerStateAutoSave(
        buildDentalViewerStatePayload(servicesManager, {
          study_instance_uid: studyInstanceUID,
          theme,
          selected_tooth: tooth,
          tooth_system: system,
        })
      );
    },
    [studyInstanceUID, servicesManager]
  );

  useEffect(() => {
    if (!studyInstanceUID || restoringRef.current) {
      return;
    }

    const saveViewportState = () => {
      persistState(selectedTooth, toothSystem, activeTheme);
    };

    const subscriptions = [
      displaySetService.subscribe(displaySetService.EVENTS.DISPLAY_SETS_ADDED, saveViewportState),
      displaySetService.subscribe(displaySetService.EVENTS.DISPLAY_SETS_CHANGED, saveViewportState),
      viewportGridService.subscribe(viewportGridService.EVENTS.GRID_STATE_CHANGED, saveViewportState),
      viewportGridService.subscribe(
        viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
        saveViewportState
      ),
    ];

    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [
    studyInstanceUID,
    selectedTooth,
    toothSystem,
    activeTheme,
    persistState,
    displaySetService,
    viewportGridService,
  ]);

  useEffect(() => () => cancelDentalViewerStateAutoSave(), []);

  const onToothChange = useCallback(
    (tooth: string) => {
      setSelectedTooth(tooth);
      persistState(tooth, toothSystem, activeTheme);
    },
    [setSelectedTooth, toothSystem, activeTheme, persistState]
  );

  const onSystemChange = useCallback(
    (system: ToothSystem) => {
      setToothSystem(system);
      persistState(selectedTooth, system, activeTheme);
    },
    [selectedTooth, activeTheme, persistState, setToothSystem]
  );

  return {
    selectedTooth,
    toothSystem,
    studyInstanceUID,
    onToothChange,
    onSystemChange,
    persistState,
  };
}

export function useDentalTheme() {
  const { activeTheme } = useActiveTheme();
  const { persistState, selectedTooth, toothSystem } = useToothSelector();

  const onThemeChange = useCallback(
    (theme: string) => {
      persistState(selectedTooth, toothSystem, theme);
    },
    [persistState, selectedTooth, toothSystem]
  );

  return { activeTheme, onThemeChange };
}
