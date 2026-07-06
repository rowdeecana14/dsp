import { useEffect, useMemo, useState } from 'react';
import { useSystem } from '@ohif/core';
import {
  getActiveStudyInstanceUID,
  getFocusedSeriesInstanceUIDs,
} from '../../measurements/services/dentalApiMappers';

function buildViewportContextKey(
  displaySetService: Parameters<typeof getActiveStudyInstanceUID>[0],
  viewportGridService: Parameters<typeof getFocusedSeriesInstanceUIDs>[1]
): string {
  const studyInstanceUID = getActiveStudyInstanceUID(displaySetService) ?? '';
  const viewportId = viewportGridService.getActiveViewportId() ?? '';
  const seriesIds = getFocusedSeriesInstanceUIDs(displaySetService, viewportGridService)
    .slice()
    .sort()
    .join('|');

  return `${studyInstanceUID}|${viewportId}|${seriesIds}`;
}

export function useDentalViewportContext() {
  const { servicesManager } = useSystem();
  const { displaySetService, viewportGridService } = servicesManager.services;
  const [contextKey, setContextKey] = useState(() =>
    buildViewportContextKey(displaySetService, viewportGridService)
  );

  useEffect(() => {
    const update = () => {
      setContextKey(buildViewportContextKey(displaySetService, viewportGridService));
    };

    update();

    const subscriptions = [
      displaySetService.subscribe(displaySetService.EVENTS.DISPLAY_SETS_CHANGED, update),
      displaySetService.subscribe(displaySetService.EVENTS.DISPLAY_SETS_ADDED, update),
      viewportGridService.subscribe(
        viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
        update
      ),
      viewportGridService.subscribe(viewportGridService.EVENTS.GRID_STATE_CHANGED, update),
    ];

    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [displaySetService, viewportGridService]);

  const studyInstanceUID = useMemo(
    () => getActiveStudyInstanceUID(displaySetService) ?? '',
    [displaySetService, contextKey]
  );

  const focusedSeriesIds = useMemo(
    () => getFocusedSeriesInstanceUIDs(displaySetService, viewportGridService),
    [displaySetService, viewportGridService, contextKey]
  );

  return {
    contextKey,
    studyInstanceUID,
    focusedSeriesIds,
    servicesManager,
    displaySetService,
    viewportGridService,
  };
}
