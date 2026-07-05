/**
 * useViewerState Hook
 * Custom hook for managing and persisting viewer state
 */

import { useState, useCallback, useEffect } from 'react';

export interface ViewerState {
  userId: string;
  studyInstanceUID: string;
  mode: string;
  theme: string;
  selectedTooth: string;
  toothSystem: 'FDI' | 'Universal';
  viewportLayout: string;
  measurements: string[];
  lastModified: string;
}

export function useViewerState(studyInstanceUID?: string, backendService?: any) {
  const [state, setState] = useState<Partial<ViewerState>>({
    mode: 'dental',
    theme: 'dental',
    selectedTooth: '11',
    toothSystem: 'FDI',
    viewportLayout: '2x2-dental',
    measurements: [],
  });

  // Load state from backend on mount
  useEffect(() => {
    if (studyInstanceUID && backendService) {
      backendService
        .getViewerState(studyInstanceUID)
        .then((loadedState: Partial<ViewerState>) => {
          setState((prev) => ({ ...prev, ...loadedState }));
        })
        .catch((error: Error) => {
          console.error('Failed to load viewer state:', error);
        });
    }
  }, [studyInstanceUID, backendService]);

  // Save state to backend
  const saveState = useCallback(
    (updatedState: Partial<ViewerState>) => {
      const newState = {
        ...state,
        ...updatedState,
        lastModified: new Date().toISOString(),
      };
      setState(newState);

      if (backendService && studyInstanceUID) {
        backendService
          .saveViewerState({ studyInstanceUID, ...newState })
          .catch((error: Error) => {
            console.error('Failed to save viewer state:', error);
          });
      }

      return newState;
    },
    [state, backendService, studyInstanceUID]
  );

  const setSelectedTooth = useCallback(
    (tooth: string) => saveState({ selectedTooth: tooth }),
    [saveState]
  );

  const setToothSystem = useCallback(
    (system: 'FDI' | 'Universal') => saveState({ toothSystem: system }),
    [saveState]
  );

  const setTheme = useCallback(
    (theme: string) => saveState({ theme }),
    [saveState]
  );

  return {
    state,
    saveState,
    setSelectedTooth,
    setToothSystem,
    setTheme,
  };
}
