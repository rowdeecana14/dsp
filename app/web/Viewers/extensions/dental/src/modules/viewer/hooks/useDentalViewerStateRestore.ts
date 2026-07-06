import { useEffect, useRef } from 'react';
import { useActiveTheme } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { subscribeDentalPersistence } from '../../measurements/services/dentalPersistence';
import {
  restoreDentalViewerState,
  type DentalViewerStateUi,
} from '../services/dentalViewerStateSync';
import type { ToothSystem } from '../../../shared/utils/toothNumbering';

type UseDentalViewerStateRestoreOptions = {
  studyInstanceUID: string | null;
  onRestore: (ui: DentalViewerStateUi) => void;
};

/** Applies server viewer state (theme, viewport) when persistence loads for the active study. */
export function useDentalViewerStateRestore({
  studyInstanceUID,
  onRestore,
}: UseDentalViewerStateRestoreOptions) {
  const { servicesManager, commandsManager } = useSystem();
  const { setActiveTheme } = useActiveTheme();
  const appliedStudyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!studyInstanceUID) {
      appliedStudyRef.current = null;
      return;
    }

    return subscribeDentalPersistence(state => {
      if (
        state.loaded_study_instance_uid !== studyInstanceUID ||
        !state.loadedViewerState ||
        appliedStudyRef.current === studyInstanceUID
      ) {
        return;
      }

      appliedStudyRef.current = studyInstanceUID;
      const ui = restoreDentalViewerState(
        servicesManager,
        commandsManager,
        state.loadedViewerState
      );
      setActiveTheme(ui.theme);
      onRestore(ui);
    });
  }, [studyInstanceUID, servicesManager, commandsManager, setActiveTheme, onRestore]);
}

export type { DentalViewerStateUi, ToothSystem };
