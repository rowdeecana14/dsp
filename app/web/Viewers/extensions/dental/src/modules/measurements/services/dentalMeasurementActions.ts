import { callInputDialog } from '@ohif/extension-default';
import {
  getActiveStudyInstanceUID,
  fromApiMeasurement,
} from './dentalApiMappers';
import {
  persistDentalMeasurements,
  removeServerMeasurement,
  updateServerMeasurement,
  getDentalPersistenceState,
  getServerMeasurementByUid,
  markDentalMeasurementsSynced,
} from './dentalPersistence';
import { restoreDentalMeasurements } from './dentalMeasurementRestore';
import {
  bulkUpdateMeasurementsOnServer,
  deleteMeasurementFromServer,
  isServerMeasurementId,
  updateMeasurementOnServer,
} from './measurementsApi';
import type { UpdateMeasurementRequest } from './measurementsApi';
import { rememberDentalMeasurementLabel } from '../../dental/store/dental.store';

const CORNERSTONE_CONTEXT = 'CORNERSTONE';

const ASYNC_COMMANDS = new Set(['renameMeasurement', 'setMeasurementLabel']);

export function viewportHasImages(
  viewport: { displaySetInstanceUIDs?: string[] },
  displaySetService: {
    getDisplaySetByUID: (uid: string) =>
      | { unsupported?: boolean; instances?: unknown[]; imageIds?: string[] }
      | undefined;
  }
): boolean {
  return (viewport.displaySetInstanceUIDs ?? []).some(uid => {
    const displaySet = displaySetService.getDisplaySetByUID(uid);
    return (
      !!displaySet &&
      !displaySet.unsupported &&
      ((displaySet.instances?.length ?? 0) > 0 || (displaySet.imageIds?.length ?? 0) > 0)
    );
  });
}

export function resolveDentalImageViewport(
  servicesManager: AppTypes.ServicesManager
): { viewportId: string; toolGroupId: string } | null {
  const { viewportGridService, displaySetService } = servicesManager.services;
  const { viewports, activeViewportId } = viewportGridService.getState();

  const candidates: string[] = [];
  if (activeViewportId) {
    candidates.push(activeViewportId);
  }
  if (!candidates.includes('dental-current')) {
    candidates.push('dental-current');
  }
  viewports.forEach((_viewport, viewportId) => {
    if (!candidates.includes(viewportId)) {
      candidates.push(viewportId);
    }
  });

  for (const viewportId of candidates) {
    const viewport = viewports.get(viewportId);
    if (!viewport || !viewportHasImages(viewport, displaySetService)) {
      continue;
    }

    return {
      viewportId,
      toolGroupId: viewport.viewportOptions?.toolGroupId ?? 'default',
    };
  }

  return null;
}

async function runLiveMeasurementCommand(
  commandsManager: AppTypes.CommandsManager,
  command: string,
  options: Record<string, unknown>
): Promise<void> {
  if (ASYNC_COMMANDS.has(command)) {
    await commandsManager.runAsync(command, options, CORNERSTONE_CONTEXT);
    return;
  }

  commandsManager.runCommand(command, options, CORNERSTONE_CONTEXT);
}

function activateViewportForMeasurementItem(
  item: Record<string, unknown>,
  commandsManager: AppTypes.CommandsManager,
  servicesManager: AppTypes.ServicesManager
): string | null {
  const { viewportGridService, displaySetService } = servicesManager.services;
  let displaySetInstanceUID = item.displaySetInstanceUID as string | undefined;

  const referenceSeriesUID = item.referenceSeriesUID as string | undefined;
  if (!displaySetInstanceUID && referenceSeriesUID) {
    const seriesDisplaySets = displaySetService.getDisplaySetsForSeries(referenceSeriesUID);
    displaySetInstanceUID = seriesDisplaySets[0]?.displaySetInstanceUID;
  }

  if (displaySetInstanceUID) {
    const { viewports, activeViewportId } = viewportGridService.getState();
    for (const [viewportId, viewport] of viewports) {
      if ((viewport.displaySetInstanceUIDs ?? []).includes(displaySetInstanceUID)) {
        if (activeViewportId !== viewportId) {
          commandsManager.runCommand(
            'setViewportActive',
            { viewportId },
            CORNERSTONE_CONTEXT
          );
        }
        return viewportId;
      }
    }
  }

  const resolved = resolveDentalImageViewport(servicesManager);
  if (resolved?.viewportId) {
    commandsManager.runCommand(
      'setViewportActive',
      { viewportId: resolved.viewportId },
      CORNERSTONE_CONTEXT
    );
    return resolved.viewportId;
  }

  return viewportGridService.getActiveViewportId() ?? null;
}

async function jumpToDentalMeasurement(
  commandsManager: AppTypes.CommandsManager,
  servicesManager: AppTypes.ServicesManager,
  uid: string,
  displayMeasurements: Record<string, unknown>[]
): Promise<void> {
  const { measurementService } = servicesManager.services;
  const listItem = displayMeasurements.find(entry => entry.uid === uid);

  if (!measurementService.getMeasurement(uid)) {
    const saved = getServerMeasurementByUid(uid);
    if (saved) {
      restoreDentalMeasurements(servicesManager, [saved]);
    }
  }

  const liveMeasurement = measurementService.getMeasurement(uid);
  const jumpItem = (liveMeasurement ?? listItem) as Record<string, unknown> | undefined;
  if (!jumpItem) {
    return;
  }

  activateViewportForMeasurementItem(jumpItem, commandsManager, servicesManager);

  await runLiveMeasurementCommand(commandsManager, 'jumpToMeasurement', {
    uid,
    annotationUID: uid,
    displayMeasurements,
  });
}

async function persistAfterServerChange(
  servicesManager: AppTypes.ServicesManager
): Promise<void> {
  const { displaySetService } = servicesManager.services;
  const studyInstanceUID = getActiveStudyInstanceUID(displaySetService);
  if (studyInstanceUID) {
    await persistDentalMeasurements(studyInstanceUID, servicesManager);
  }
}

function resolvePersistedMeasurementId(uid: string): string | null {
  if (isServerMeasurementId(uid)) {
    return uid;
  }

  const saved = getDentalPersistenceState().serverMeasurements.find(
    (measurement, index) => {
      const itemUid =
        measurement.id ??
        `server-${measurement.captured_at}-${measurement.label}-${index}`;
      return itemUid === uid;
    }
  );

  return saved?.id && isServerMeasurementId(saved.id) ? saved.id : null;
}

function applyServerMeasurementPatch(
  uid: string,
  measurement: ReturnType<typeof fromApiMeasurement>
): void {
  updateServerMeasurement(uid, () => measurement);
}

async function patchMeasurementOnServer(
  servicesManager: AppTypes.ServicesManager,
  uid: string,
  body: Parameters<typeof updateMeasurementOnServer>[1],
  fallbackPersist = true
): Promise<boolean> {
  const measurementId = resolvePersistedMeasurementId(uid);
  if (!measurementId) {
    if (fallbackPersist) {
      await persistAfterServerChange(servicesManager);
    }
    return false;
  }

  const updated = await updateMeasurementOnServer(measurementId, body);
  if (!updated) {
    return false;
  }

  applyServerMeasurementPatch(uid, fromApiMeasurement(updated));
  markDentalMeasurementsSynced(servicesManager);
  return true;
}

async function renameServerMeasurement(
  servicesManager: AppTypes.ServicesManager,
  uid: string,
  currentLabel: string
): Promise<void> {
  const { uiDialogService } = servicesManager.services;
  const label = await callInputDialog({
    uiDialogService,
    title: 'Edit Measurement Label',
    placeholder: 'Enter new label',
    defaultValue: currentLabel,
  });

  if (label === undefined || label === null) {
    return;
  }

  const nextLabel = String(label).trim() || currentLabel;
  rememberDentalMeasurementLabel(uid, nextLabel);
  updateServerMeasurement(uid, saved => ({
    ...saved,
    label: nextLabel,
  }));

  const ok = await patchMeasurementOnServer(servicesManager, uid, {
    action: 'rename',
    label: nextLabel,
  });

  if (!ok) {
    await persistAfterServerChange(servicesManager);
  }
}

async function toggleServerMeasurementLock(
  servicesManager: AppTypes.ServicesManager,
  uid: string,
  item: Record<string, unknown>
): Promise<void> {
  const nextLocked = !(item.isLocked === true);
  updateServerMeasurement(uid, saved => ({
    ...saved,
    coordinates: {
      ...(saved.coordinates ?? {}),
      is_locked: nextLocked,
    },
  }));

  const ok = await patchMeasurementOnServer(servicesManager, uid, {
    action: 'lock',
    is_locked: nextLocked,
  });

  if (!ok) {
    await persistAfterServerChange(servicesManager);
  }
}

async function toggleServerMeasurementVisibility(
  servicesManager: AppTypes.ServicesManager,
  uid: string,
  item: Record<string, unknown>
): Promise<void> {
  const nextVisible = item.isVisible === false;
  updateServerMeasurement(uid, saved => ({
    ...saved,
    coordinates: {
      ...(saved.coordinates ?? {}),
      is_visible: nextVisible,
    },
  }));

  const ok = await patchMeasurementOnServer(servicesManager, uid, {
    action: nextVisible ? 'visible' : 'hide',
  });

  if (!ok) {
    await persistAfterServerChange(servicesManager);
  }
}

async function deleteServerMeasurement(
  servicesManager: AppTypes.ServicesManager,
  uid: string
): Promise<void> {
  const measurementId = resolvePersistedMeasurementId(uid);

  if (measurementId) {
    const ok = await deleteMeasurementFromServer(measurementId);
    if (ok) {
      removeServerMeasurement(uid);
      markDentalMeasurementsSynced(servicesManager);
      return;
    }
  }

  removeServerMeasurement(uid);
  await persistAfterServerChange(servicesManager);
}

export function activateDentalMeasurementTool(
  commandsManager: AppTypes.CommandsManager,
  servicesManager: AppTypes.ServicesManager,
  toolName: string
): void {
  const target = resolveDentalImageViewport(servicesManager);

  if (target) {
    commandsManager.runCommand('setViewportActive', { viewportId: target.viewportId }, CORNERSTONE_CONTEXT);
  }

  commandsManager.runCommand(
    'setToolActiveToolbar',
    {
      toolName,
      toolGroupIds: target ? [target.toolGroupId] : ['default'],
    },
    CORNERSTONE_CONTEXT
  );
}

async function syncLiveMeasurementAction(
  servicesManager: AppTypes.ServicesManager,
  command: string,
  uid: string
): Promise<void> {
  const { measurementService } = servicesManager.services;
  const measurement = measurementService.getMeasurement(uid);
  if (!measurement) {
    return;
  }

  if (command === 'renameMeasurement') {
    const label = String(measurement.label ?? '').trim();
    if (label) {
      rememberDentalMeasurementLabel(uid, label);
      await patchMeasurementOnServer(
        servicesManager,
        uid,
        { action: 'rename', label },
        false
      );
    }
    return;
  }

  if (command === 'toggleLockMeasurement') {
    await patchMeasurementOnServer(
      servicesManager,
      uid,
      { action: 'lock', is_locked: measurement.isLocked === true },
      false
    );
    return;
  }

  if (command === 'toggleVisibilityMeasurement') {
    const isVisible = measurement.isVisible !== false;
    await patchMeasurementOnServer(
      servicesManager,
      uid,
      { action: isVisible ? 'hide' : 'visible' },
      false
    );
  }
}

export async function handleDentalMeasurementAction(
  commandsManager: AppTypes.CommandsManager,
  servicesManager: AppTypes.ServicesManager,
  command: string,
  uid: string,
  displayMeasurements: Record<string, unknown>[]
): Promise<void> {
  const { measurementService } = servicesManager.services;
  const options = {
    uid,
    annotationUID: uid,
    displayMeasurements,
  };

  if (command === 'jumpToMeasurement') {
    await jumpToDentalMeasurement(commandsManager, servicesManager, uid, displayMeasurements);
    return;
  }

  const liveMeasurement = measurementService.getMeasurement(uid);
  if (liveMeasurement) {
    if (command === 'removeMeasurement') {
      await runLiveMeasurementCommand(commandsManager, command, options);
      const measurementId = resolvePersistedMeasurementId(uid);
      if (measurementId) {
        await deleteMeasurementFromServer(measurementId);
      }
      removeServerMeasurement(uid);
      return;
    }

    await runLiveMeasurementCommand(commandsManager, command, options);
    if (
      command === 'renameMeasurement' ||
      command === 'toggleLockMeasurement' ||
      command === 'toggleVisibilityMeasurement'
    ) {
      await syncLiveMeasurementAction(servicesManager, command, uid);
    }
    return;
  }

  const item = displayMeasurements.find(entry => entry.uid === uid);
  if (!item) {
    return;
  }

  if (command === 'removeMeasurement') {
    await deleteServerMeasurement(servicesManager, uid);
    return;
  }

  if (command === 'renameMeasurement') {
    await renameServerMeasurement(
      servicesManager,
      uid,
      String(item.label ?? 'Measurement')
    );
    return;
  }

  if (command === 'toggleLockMeasurement') {
    await toggleServerMeasurementLock(servicesManager, uid, item);
    return;
  }

  if (command === 'toggleVisibilityMeasurement') {
    await toggleServerMeasurementVisibility(servicesManager, uid, item);
    return;
  }
}

export async function deleteDentalMeasurements(
  commandsManager: AppTypes.CommandsManager,
  servicesManager: AppTypes.ServicesManager,
  uids: string[],
  displayMeasurements: Record<string, unknown>[]
): Promise<void> {
  const uniqueUids = [...new Set(uids.filter(Boolean))];
  for (const uid of uniqueUids) {
    await handleDentalMeasurementAction(
      commandsManager,
      servicesManager,
      'removeMeasurement',
      uid,
      displayMeasurements
    );
  }

  const studyInstanceUID = getActiveStudyInstanceUID(servicesManager.services.displaySetService);
  if (studyInstanceUID) {
    markDentalMeasurementsSynced(servicesManager);
  }
}

export async function renameDentalMeasurementLabels(
  commandsManager: AppTypes.CommandsManager,
  servicesManager: AppTypes.ServicesManager,
  updates: Array<{ uid: string; label: string }>,
  displayMeasurements: Record<string, unknown>[]
): Promise<void> {
  const validUpdates = updates
    .map(({ uid, label }) => ({ uid, label: label.trim() }))
    .filter(({ uid, label }) => uid && label);

  if (!validUpdates.length) {
    return;
  }

  for (const { uid, label } of validUpdates) {
    await renameMeasurementToLabel(
      commandsManager,
      servicesManager,
      uid,
      displayMeasurements,
      label
    );
  }

  await persistAfterServerChange(servicesManager);
}

export type BulkMeasurementUpdateAction = 'lock' | 'unlock' | 'rename';

async function renameMeasurementToLabel(
  commandsManager: AppTypes.CommandsManager,
  servicesManager: AppTypes.ServicesManager,
  uid: string,
  displayMeasurements: Record<string, unknown>[],
  label: string,
  skipServerPatch = false
): Promise<void> {
  const trimmed = label.trim();
  if (!trimmed) {
    return;
  }

  const { measurementService } = servicesManager.services;
  const liveMeasurement = measurementService.getMeasurement(uid);

  rememberDentalMeasurementLabel(uid, trimmed);

  if (liveMeasurement) {
    measurementService.update(
      uid,
      {
        ...liveMeasurement,
        label: trimmed,
      },
      true
    );
    if (!skipServerPatch) {
      await patchMeasurementOnServer(
        servicesManager,
        uid,
        { action: 'rename', label: trimmed },
        false
      );
    }
    return;
  }

  if (skipServerPatch) {
    return;
  }

  const item = displayMeasurements.find(entry => entry.uid === uid);
  if (!item) {
    return;
  }

  updateServerMeasurement(uid, saved => ({
    ...saved,
    label: trimmed,
  }));

  const ok = await patchMeasurementOnServer(servicesManager, uid, {
    action: 'rename',
    label: trimmed,
  });

  if (!ok) {
    await persistAfterServerChange(servicesManager);
  }
}

async function setMeasurementLockState(
  commandsManager: AppTypes.CommandsManager,
  servicesManager: AppTypes.ServicesManager,
  uid: string,
  displayMeasurements: Record<string, unknown>[],
  isLocked: boolean,
  skipServerPatch = false
): Promise<void> {
  const { measurementService } = servicesManager.services;
  const liveMeasurement = measurementService.getMeasurement(uid);

  if (liveMeasurement) {
    if (liveMeasurement.isLocked !== isLocked) {
      await runLiveMeasurementCommand(
        commandsManager,
        'toggleLockMeasurement',
        { uid, annotationUID: uid, displayMeasurements }
      );
      if (!skipServerPatch) {
        await syncLiveMeasurementAction(servicesManager, 'toggleLockMeasurement', uid);
      }
    } else if (!skipServerPatch) {
      await patchMeasurementOnServer(
        servicesManager,
        uid,
        { action: 'lock', is_locked: isLocked },
        false
      );
    }
    return;
  }

  if (skipServerPatch) {
    return;
  }

  const item = displayMeasurements.find(entry => entry.uid === uid);
  if (!item || item.isLocked === isLocked) {
    return;
  }

  updateServerMeasurement(uid, saved => ({
    ...saved,
    coordinates: {
      ...(saved.coordinates ?? {}),
      is_locked: isLocked,
    },
  }));

  const ok = await patchMeasurementOnServer(servicesManager, uid, {
    action: 'lock',
    is_locked: isLocked,
  });

  if (!ok) {
    await persistAfterServerChange(servicesManager);
  }
}

function buildBulkUpdateRequest(
  action: BulkMeasurementUpdateAction,
  label?: string
): UpdateMeasurementRequest | null {
  if (action === 'lock') {
    return { action: 'lock', is_locked: true };
  }
  if (action === 'unlock') {
    return { action: 'lock', is_locked: false };
  }
  if (action === 'rename' && label?.trim()) {
    return { action: 'rename', label: label.trim() };
  }
  return null;
}

export async function bulkUpdateDentalMeasurements(
  commandsManager: AppTypes.CommandsManager,
  servicesManager: AppTypes.ServicesManager,
  uids: string[],
  action: BulkMeasurementUpdateAction,
  displayMeasurements: Record<string, unknown>[],
  options?: { label?: string }
): Promise<void> {
  const uniqueUids = [...new Set(uids.filter(Boolean))];
  if (!uniqueUids.length) {
    return;
  }

  let renameLabel = options?.label?.trim();

  if (action === 'rename' && !renameLabel) {
    const { uiDialogService } = servicesManager.services;
    const label = await callInputDialog({
      uiDialogService,
      title: 'Rename selected measurements',
      placeholder: 'Enter label for all selected items',
      defaultValue: '',
    });
    if (label === undefined || label === null) {
      return;
    }
    renameLabel = String(label).trim();
    if (!renameLabel) {
      return;
    }
  }

  const request = buildBulkUpdateRequest(action, renameLabel);
  if (!request) {
    return;
  }

  const serverIdByUid = new Map<string, string>();
  uniqueUids.forEach(uid => {
    const id = resolvePersistedMeasurementId(uid);
    if (id) {
      serverIdByUid.set(uid, id);
    }
  });

  const bulkSucceededIds = new Set<string>();
  const allHaveServerIds = serverIdByUid.size === uniqueUids.length;

  if (allHaveServerIds && serverIdByUid.size > 0) {
    const bulkResult = await bulkUpdateMeasurementsOnServer(
      [...serverIdByUid.values()],
      request
    );
    if (bulkResult) {
      bulkResult.updated.forEach(record => {
        const uid =
          uniqueUids.find(
            candidate => resolvePersistedMeasurementId(candidate) === record.id
          ) ?? record.id;
        applyServerMeasurementPatch(uid, fromApiMeasurement(record));
        bulkSucceededIds.add(record.id);
      });
    }
  }

  let needsPersist = false;

  for (const uid of uniqueUids) {
    const serverId = serverIdByUid.get(uid);
    const skipServerPatch = !!(serverId && bulkSucceededIds.has(serverId));

    if (action === 'lock') {
      await setMeasurementLockState(
        commandsManager,
        servicesManager,
        uid,
        displayMeasurements,
        true,
        skipServerPatch
      );
    } else if (action === 'unlock') {
      await setMeasurementLockState(
        commandsManager,
        servicesManager,
        uid,
        displayMeasurements,
        false,
        skipServerPatch
      );
    } else if (action === 'rename' && renameLabel) {
      await renameMeasurementToLabel(
        commandsManager,
        servicesManager,
        uid,
        displayMeasurements,
        renameLabel,
        skipServerPatch
      );
    }

    if (!serverId) {
      needsPersist = true;
    }
  }

  if (needsPersist || !bulkSucceededIds.size) {
    await persistAfterServerChange(servicesManager);
  }
}
