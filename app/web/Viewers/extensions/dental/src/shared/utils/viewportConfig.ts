import type { ViewportConfig } from '../types/viewport';
import { VIEWPORT_SLOT_MAP } from '../constants/viewports';

export function buildViewportConfig(
  displaySetService: {
    getDisplaySetByUID: (uid: string) =>
      | {
          displaySetInstanceUID?: string;
          SeriesInstanceUID?: string;
          seriesInstanceUID?: string;
        }
      | undefined;
  },
  viewportGridService: {
    getState: () => { viewports: Map<string, unknown> };
    getDisplaySetsUIDsForViewport: (viewportId: string) => string[] | undefined;
  }
): ViewportConfig {
  const config: ViewportConfig = {};
  const gridState = viewportGridService.getState();

  Array.from(gridState.viewports.keys()).forEach(viewportId => {
    const slot = VIEWPORT_SLOT_MAP[viewportId];
    if (!slot) {
      return;
    }

    const displaySetUIDs = viewportGridService.getDisplaySetsUIDsForViewport(viewportId) ?? [];
    const displaySet = displaySetUIDs[0]
      ? displaySetService.getDisplaySetByUID(displaySetUIDs[0])
      : undefined;

    const imageId =
      displaySet?.displaySetInstanceUID ??
      displaySet?.SeriesInstanceUID ??
      displaySet?.seriesInstanceUID;

    if (imageId) {
      config[slot] = imageId;
    }
  });

  if (config.bottom_left || config.bottom_right) {
    config.bottom = [config.bottom_left, config.bottom_right].filter(Boolean).join(',');
  }

  return config;
}

export function getActiveViewportSlot(
  viewportGridService: { getActiveViewportId: () => string | undefined }
): string | undefined {
  const viewportId = viewportGridService.getActiveViewportId();
  if (!viewportId) {
    return undefined;
  }
  return VIEWPORT_SLOT_MAP[viewportId] ?? viewportId;
}
