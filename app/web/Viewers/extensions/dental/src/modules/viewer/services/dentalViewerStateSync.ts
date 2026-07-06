import debounce from 'lodash.debounce';
import type { ViewerStatePayload, ViewerStateRecord } from '../../measurements/types/measurement.types';
import { persistDentalViewerState } from '../../measurements/services/dentalPersistence';
import { hasAuthToken } from './viewerStateApi';
import { buildViewportConfig } from '../../../shared/utils/viewportConfig';
import { ToothSystem } from '../../../shared/utils/toothNumbering';
import { DENTAL_VIEWPORT_IDS } from '../../../shared/constants/viewports';

const SLOT_TO_VIEWPORT: Record<string, string> = {
  top_left: DENTAL_VIEWPORT_IDS.current,
  top_right: DENTAL_VIEWPORT_IDS.prior,
  bottom_left: DENTAL_VIEWPORT_IDS.bwLeft,
  bottom_right: DENTAL_VIEWPORT_IDS.bwRight,
};

export type DentalViewerStateUi = {
  selectedTooth: string;
  toothSystem: ToothSystem;
  theme: string;
};

export function viewerStateToUi(state: ViewerStateRecord): DentalViewerStateUi {
  return {
    selectedTooth: state.selected_tooth ?? '11',
    toothSystem: (state.tooth_system ?? 'FDI') as ToothSystem,
    theme: state.theme ?? 'dental',
  };
}

export function buildDentalViewerStatePayload(
  servicesManager: AppTypes.ServicesManager,
  overrides: Partial<ViewerStatePayload> & { study_instance_uid: string }
): ViewerStatePayload {
  const { displaySetService, viewportGridService } = servicesManager.services;
  const sets = displaySetService.getActiveDisplaySets();
  const instance = sets[0]?.instances?.[0] || sets[0]?.instance;
  const patient_id = String(instance?.PatientID ?? '');

  return {
    mode: 'dental',
    theme: 'dental',
    viewport_layout: '2x2-dental',
    patient_id,
    viewport_config: buildViewportConfig(displaySetService, viewportGridService),
    ...overrides,
  };
}

export function restoreDentalViewerState(
  servicesManager: AppTypes.ServicesManager,
  commandsManager: AppTypes.CommandsManager,
  state: ViewerStateRecord | null
): DentalViewerStateUi {
  const ui = state ? viewerStateToUi(state) : { selectedTooth: '11', toothSystem: 'FDI' as ToothSystem, theme: 'dental' };

  const { viewportGridService } = servicesManager.services;
  const viewports = viewportGridService.getState?.()?.viewports;
  if (!viewports?.size) {
    return ui;
  }

  const viewport_config = state?.viewport_config;
  if (viewport_config) {
    const preferredSlot =
      (viewport_config.top_left && 'top_left') ||
      (viewport_config.top_right && 'top_right') ||
      (viewport_config.bottom_left && 'bottom_left') ||
      (viewport_config.bottom_right && 'bottom_right');

    const viewportId = preferredSlot ? SLOT_TO_VIEWPORT[preferredSlot] : 'dental-current';
    if (viewportId) {
      commandsManager.runCommand('setViewportActive', { viewportId }, 'CORNERSTONE');
    }
  }

  return ui;
}

let debouncedViewerStateSave: ReturnType<typeof debounce> | null = null;
let pendingViewerStatePayload: ViewerStatePayload | null = null;

function runViewerStateAutoSave() {
  if (!hasAuthToken() || !pendingViewerStatePayload) {
    return;
  }

  void persistDentalViewerState(pendingViewerStatePayload);
}

export function scheduleDentalViewerStateAutoSave(payload: ViewerStatePayload): void {
  if (!hasAuthToken() || !payload.study_instance_uid) {
    return;
  }

  pendingViewerStatePayload = payload;

  if (!debouncedViewerStateSave) {
    debouncedViewerStateSave = debounce(runViewerStateAutoSave, 1500);
  }

  debouncedViewerStateSave();
}

export function flushDentalViewerStateAutoSave(): void {
  debouncedViewerStateSave?.flush();
}

export function cancelDentalViewerStateAutoSave(): void {
  debouncedViewerStateSave?.cancel();
  pendingViewerStatePayload = null;
}
