import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MeasurementPanelSortField } from '../store/measurement.store';
import { getPanelUiState, useMeasurementStore } from '../store/measurement.store';
import { useSystem } from '@ohif/core';
import { useMeasurements } from '../../../../../cornerstone/src/hooks/useMeasurements';
import { hasAuthToken } from '../../viewer/services/viewerStateApi';
import {
  downloadMeasurementsJson,
  fetchMeasurementsPage,
} from '../services/measurementsApi';
import type { ApiPaginationMeta } from '../types/measurement.types';
import {
  subscribeDentalPersistence,
  persistDentalMeasurements,
  getDentalPersistenceState,
  markDentalMeasurementsSynced,
  type DentalPersistenceState,
} from '../services/dentalPersistence';
import {
  mapMeasurementToExport,
  hasUnsavedMeasurementChanges,
} from '../services/dentalApiMappers';
import {
  liveMeasurementToDisplayItem,
  serverMeasurementToDisplayItem,
} from '../services/dentalMeasurementRestore';
import { useDentalViewportContext } from '../../viewer/hooks/useDentalViewportContext';
import { useDelayedLoading } from '../../../shared/hooks/useDelayedLoading';
import {
  DENTAL_MEASUREMENT_PRESETS,
  resolveDentalMeasurementLabel,
} from '../../dental/store/dental.store';
import { deleteDentalMeasurements, renameDentalMeasurementLabels } from '../services/dentalMeasurementActions';
import {
  showDentalErrorNotification,
  showDentalSuccessNotification,
} from '../../../shared/utils/dentalNotifications';
import type { EditMeasurementItem } from '../components/EditMeasurementsDialog';

type SortField = MeasurementPanelSortField;
type PresetFilter = 'all' | (typeof DENTAL_MEASUREMENT_PRESETS)[number]['id'];

function extractValue(measurement: Record<string, unknown>): string {
  const displayText = measurement.displayText as { primary?: string[] } | undefined;
  if (displayText?.primary?.length) {
    return displayText.primary.join(' ');
  }
  return resolveDentalMeasurementLabel(measurement);
}

function matchesPresetFilter(
  measurement: Record<string, unknown>,
  presetFilter: PresetFilter
): boolean {
  if (presetFilter === 'all') {
    return true;
  }

  const preset = DENTAL_MEASUREMENT_PRESETS.find(p => p.id === presetFilter);
  if (!preset) {
    return true;
  }

  const presetId = (measurement as { dentalPresetId?: string }).dentalPresetId;
  if (presetId) {
    return presetId === presetFilter;
  }

  return resolveDentalMeasurementLabel(measurement) === preset.label;
}

function matchesTextFilter(measurement: Record<string, unknown>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }

  const label = resolveDentalMeasurementLabel(measurement).toLowerCase();
  const value = extractValue(measurement).toLowerCase();
  const tool = String(measurement.toolName ?? measurement.type ?? '').toLowerCase();
  const unit = String((measurement as { unit?: string }).unit ?? '').toLowerCase();
  const presetId = String((measurement as { dentalPresetId?: string }).dentalPresetId ?? '').toLowerCase();

  return [label, value, tool, unit, presetId].some(field => field.includes(q));
}

function sortMeasurements(
  items: Record<string, unknown>[],
  field: SortField,
  asc: boolean
): Record<string, unknown>[] {
  return [...items].sort((a, b) => {
    let cmp = 0;
    if (field === 'label') {
      cmp = resolveDentalMeasurementLabel(a).localeCompare(resolveDentalMeasurementLabel(b));
    } else if (field === 'value') {
      cmp = extractValue(a).localeCompare(extractValue(b));
    } else {
      const da = (a as { createdAt?: number }).createdAt ?? 0;
      const db = (b as { createdAt?: number }).createdAt ?? 0;
      cmp = da - db;
    }
    return asc ? cmp : -cmp;
  });
}

function toApiSortField(field: SortField): string {
  if (field === 'date') {
    return 'created_at';
  }
  return field;
}

function useMeasurementsPanel() {
  const { servicesManager, commandsManager } = useSystem();
  const { studyInstanceUID } = useDentalViewportContext();
  const { displaySetService } = servicesManager.services;

  const panelState = useMeasurementStore(state =>
    getPanelUiState(state.panelStateByStudy, studyInstanceUID)
  );
  const {
    filterText,
    presetFilter: rawPresetFilter,
    sortField,
    sortAsc,
    page,
    pageSize,
    selectedUids,
    filtersExpanded,
  } = panelState;
  const presetFilter = rawPresetFilter as PresetFilter;

  const storeSetFilterText = useMeasurementStore(state => state.setFilterText);
  const storeSetPresetFilter = useMeasurementStore(state => state.setPresetFilter);
  const storeSetSortField = useMeasurementStore(state => state.setSortField);
  const storeSetPage = useMeasurementStore(state => state.setPage);
  const storeSetPageSize = useMeasurementStore(state => state.setPageSize);
  const storeSetFiltersExpanded = useMeasurementStore(state => state.setFiltersExpanded);
  const storeSetSortAsc = useMeasurementStore(state => state.setSortAsc);
  const storeSetSelectedUids = useMeasurementStore(state => state.setSelectedUids);

  const requireStudy = useCallback(() => studyInstanceUID || null, [studyInstanceUID]);

  const setFilterText = useCallback(
    (text: string) => {
      const uid = requireStudy();
      if (uid) storeSetFilterText(uid, text);
    },
    [requireStudy, storeSetFilterText]
  );

  const setPresetFilter = useCallback(
    (filter: PresetFilter) => {
      const uid = requireStudy();
      if (uid) storeSetPresetFilter(uid, filter);
    },
    [requireStudy, storeSetPresetFilter]
  );

  const setSortField = useCallback(
    (field: SortField) => {
      const uid = requireStudy();
      if (uid) storeSetSortField(uid, field);
    },
    [requireStudy, storeSetSortField]
  );

  const setPage = useCallback(
    (nextPage: number) => {
      const uid = requireStudy();
      if (uid) storeSetPage(uid, nextPage);
    },
    [requireStudy, storeSetPage]
  );

  const setPageSize = useCallback(
    (size: number) => {
      const uid = requireStudy();
      if (uid) storeSetPageSize(uid, size);
    },
    [requireStudy, storeSetPageSize]
  );

  const setFiltersExpanded = useCallback(
    (expanded: boolean) => {
      const uid = requireStudy();
      if (uid) storeSetFiltersExpanded(uid, expanded);
    },
    [requireStudy, storeSetFiltersExpanded]
  );

  const setSortAsc = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const uid = requireStudy();
      if (!uid) return;
      const current = getPanelUiState(useMeasurementStore.getState().panelStateByStudy, uid).sortAsc;
      const next = typeof value === 'function' ? value(current) : value;
      storeSetSortAsc(uid, next);
    },
    [requireStudy, storeSetSortAsc]
  );

  const setSelectedUids = useCallback(
    (value: Set<string> | ((prev: Set<string>) => Set<string>)) => {
      const uid = requireStudy();
      if (!uid) return;
      const current = getPanelUiState(useMeasurementStore.getState().panelStateByStudy, uid)
        .selectedUids;
      const next = typeof value === 'function' ? value(current) : value;
      storeSetSelectedUids(uid, next);
    },
    [requireStudy, storeSetSelectedUids]
  );

  const setFiltersExpandedWithUpdater = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const uid = requireStudy();
      if (!uid) return;
      const current = getPanelUiState(useMeasurementStore.getState().panelStateByStudy, uid)
        .filtersExpanded;
      const next = typeof value === 'function' ? value(current) : value;
      storeSetFiltersExpanded(uid, next);
    },
    [requireStudy, storeSetFiltersExpanded]
  );

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [selectedDetails, setSelectedDetails] = useState<Map<string, EditMeasurementItem>>(
    () => new Map()
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listItems, setListItems] = useState<Record<string, unknown>[]>([]);
  const [listMeta, setListMeta] = useState<ApiPaginationMeta | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [persistenceState, setPersistenceState] = useState<DentalPersistenceState>(() =>
    getDentalPersistenceState()
  );

  const useApiList = hasAuthToken() && !!studyInstanceUID;
  const showDelayedListLoading = useDelayedLoading(isLoadingList);

  useEffect(() => {
    setDebouncedSearch(filterText.trim());
    setSelectedDetails(new Map());
    setConfirmDeleteOpen(false);
    setEditDialogOpen(false);
  }, [studyInstanceUID]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filterText.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filterText]);

  const loadMeasurementsPage = useCallback(async () => {
    if (!useApiList || !studyInstanceUID) {
      return;
    }

    setIsLoadingList(true);
    try {
      const result = await fetchMeasurementsPage({
        study_instance_uid: studyInstanceUID,
        page,
        limit: pageSize,
        sort_by: toApiSortField(sortField),
        sort_order: sortAsc ? 'ASC' : 'DESC',
        search: debouncedSearch || undefined,
        dental_preset_id: presetFilter === 'all' ? undefined : presetFilter,
      });

      if (!result) {
        setListItems([]);
        setListMeta(null);
        return;
      }

      setListItems(
        result.measurements.map((saved, index) =>
          serverMeasurementToDisplayItem(saved, displaySetService, index)
        )
      );
      setListMeta(result.meta);

      if (result.meta.last_page > 0 && page > result.meta.last_page) {
        setPage(result.meta.last_page);
      }
    } finally {
      setIsLoadingList(false);
    }
  }, [
    useApiList,
    studyInstanceUID,
    page,
    pageSize,
    sortField,
    sortAsc,
    debouncedSearch,
    presetFilter,
    displaySetService,
  ]);

  useEffect(() => {
    if (!useApiList) {
      return;
    }
    void loadMeasurementsPage();
  }, [useApiList, loadMeasurementsPage]);

  useEffect(() => {
    return subscribeDentalPersistence(state => {
      setPersistenceState({ ...state });
      if (state.syncStatus === 'synced' && useApiList) {
        void loadMeasurementsPage();
      }
    });
  }, [useApiList, loadMeasurementsPage]);

  const liveMeasurements = useMeasurements();

  const offlineMeasurements = useMemo(() => {
    if (useApiList) {
      return [];
    }

    return liveMeasurements
      .map(liveMeasurementToDisplayItem)
      .filter(
        measurement =>
          matchesPresetFilter(measurement, presetFilter) &&
          matchesTextFilter(measurement, filterText)
      );
  }, [useApiList, liveMeasurements, presetFilter, filterText]);

  const offlineSortedMeasurements = useMemo(
    () => sortMeasurements(offlineMeasurements, sortField, sortAsc),
    [offlineMeasurements, sortField, sortAsc]
  );

  const offlineTotalPages = Math.max(1, Math.ceil(offlineSortedMeasurements.length / pageSize));
  const offlineSafePage = Math.min(page, offlineTotalPages);

  const offlinePaginatedMeasurements = useMemo(() => {
    const start = (offlineSafePage - 1) * pageSize;
    return offlineSortedMeasurements.slice(start, start + pageSize);
  }, [offlineSortedMeasurements, offlineSafePage, pageSize]);

  const displayMeasurements = useApiList ? listItems : offlinePaginatedMeasurements;
  const paginationMeta = useApiList
    ? listMeta
    : {
        total: offlineSortedMeasurements.length,
        page: offlineSafePage,
        limit: pageSize,
        last_page: offlineTotalPages,
        sort_by: toApiSortField(sortField),
        sort_order: sortAsc ? 'ASC' : 'DESC',
      };

  const pageOffset = useApiList
    ? ((paginationMeta?.page ?? 1) - 1) * (paginationMeta?.limit ?? pageSize)
    : (offlineSafePage - 1) * pageSize;

  const pageUids = useMemo(
    () => displayMeasurements.map(measurement => String(measurement.uid)),
    [displayMeasurements]
  );

  const selectedVisibleCount = useMemo(
    () => selectedUids.size,
    [selectedUids]
  );

  const selectedPageCount = useMemo(
    () => pageUids.filter(uid => selectedUids.has(uid)).length,
    [pageUids, selectedUids]
  );

  const allPageSelected =
    pageUids.length > 0 && selectedPageCount === pageUids.length;

  const selectAllState: boolean | 'indeterminate' =
    selectedPageCount === 0
      ? false
      : allPageSelected
        ? true
        : 'indeterminate';

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, presetFilter, sortField, sortAsc, pageSize, studyInstanceUID, useApiList]);

  useEffect(() => {
    if (!useApiList && page > offlineTotalPages) {
      setPage(offlineTotalPages);
    }
  }, [useApiList, page, offlineTotalPages]);

  const hasActiveFilters = presetFilter !== 'all' || filterText.trim().length > 0;

  const clearFilters = useCallback(() => {
    setFilterText('');
    setPresetFilter('all');
  }, []);

  const rememberSelectedItem = useCallback((item: Record<string, unknown>) => {
    const uid = String(item.uid);
    setSelectedDetails(prev => {
      const next = new Map(prev);
      next.set(uid, {
        uid,
        label: resolveDentalMeasurementLabel(item),
        value: extractValue(item),
      });
      return next;
    });
  }, []);

  const forgetSelectedItem = useCallback((uid: string) => {
    setSelectedDetails(prev => {
      if (!prev.has(uid)) {
        return prev;
      }
      const next = new Map(prev);
      next.delete(uid);
      return next;
    });
  }, []);

  const editDialogItems = useMemo<EditMeasurementItem[]>(
    () =>
      [...selectedUids]
        .map(uid => selectedDetails.get(uid))
        .filter((item): item is EditMeasurementItem => !!item),
    [selectedUids, selectedDetails]
  );

  const handleToggleSelect = useCallback(
    (uid: string, checked: boolean, item?: Record<string, unknown>) => {
      setSelectedUids(prev => {
        const next = new Set(prev);
        if (checked) {
          next.add(uid);
        } else {
          next.delete(uid);
        }
        return next;
      });

      if (checked && item) {
        rememberSelectedItem(item);
      } else if (!checked) {
        forgetSelectedItem(uid);
      }
    },
    [rememberSelectedItem, forgetSelectedItem]
  );

  const handleToggleSelectAll = useCallback(() => {
    if (allPageSelected) {
      setSelectedUids(prev => {
        const next = new Set(prev);
        pageUids.forEach(uid => next.delete(uid));
        return next;
      });
      setSelectedDetails(prev => {
        const next = new Map(prev);
        pageUids.forEach(uid => next.delete(uid));
        return next;
      });
      return;
    }

    setSelectedUids(prev => {
      const next = new Set(prev);
      displayMeasurements.forEach(item => next.add(String(item.uid)));
      return next;
    });
    setSelectedDetails(prev => {
      const next = new Map(prev);
      displayMeasurements.forEach(item => {
        const uid = String(item.uid);
        next.set(uid, {
          uid,
          label: resolveDentalMeasurementLabel(item),
          value: extractValue(item),
        });
      });
      return next;
    });
  }, [allPageSelected, pageUids, displayMeasurements]);

  const handleSaveEdits = async (updates: Array<{ uid: string; label: string }>) => {
    const changedUpdates = updates.filter(({ uid, label }) => {
      const item = editDialogItems.find(entry => entry.uid === uid);
      return item && item.label !== label.trim();
    });

    if (!changedUpdates.length) {
      setEditDialogOpen(false);
      return;
    }

    if (isSavingEdits) {
      return;
    }

    setIsSavingEdits(true);
    try {
      await renameDentalMeasurementLabels(
        commandsManager,
        servicesManager,
        changedUpdates,
        displayMeasurements
      );
      setEditDialogOpen(false);
      if (useApiList) {
        await loadMeasurementsPage();
      }
      markDentalMeasurementsSynced(servicesManager);
      const count = changedUpdates.length;
      showDentalSuccessNotification(
        servicesManager,
        count === 1 ? 'Measurement updated' : 'Measurements updated',
        count === 1
          ? 'The measurement name was saved.'
          : `${count} measurement names were saved.`
      );
    } catch {
      showDentalErrorNotification(
        servicesManager,
        'Update failed',
        'Could not save measurement names. Please try again.'
      );
    } finally {
      setIsSavingEdits(false);
    }
  };

  const handleConfirmDelete = async () => {
    const uidsToDelete = [...selectedUids];
    if (!uidsToDelete.length) {
      setConfirmDeleteOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDentalMeasurements(
        commandsManager,
        servicesManager,
        uidsToDelete,
        displayMeasurements
      );
      setSelectedUids(new Set());
      setSelectedDetails(new Map());
      if (useApiList) {
        await loadMeasurementsPage();
      }
      markDentalMeasurementsSynced(servicesManager);
      const count = uidsToDelete.length;
      showDentalSuccessNotification(
        servicesManager,
        count === 1 ? 'Measurement deleted' : 'Measurements deleted',
        count === 1
          ? 'The measurement was removed.'
          : `${count} measurements were removed.`
      );
    } catch {
      showDentalErrorNotification(
        servicesManager,
        'Delete failed',
        'Could not delete the selected measurements. Please try again.'
      );
    } finally {
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  const handleExport = async () => {
    if (!hasExportableData) {
      return;
    }

    try {
      if (useApiList && studyInstanceUID) {
        const exportLimit = Math.min(paginationMeta?.total ?? 100, 100);
        const result = await fetchMeasurementsPage({
          study_instance_uid: studyInstanceUID,
          page: 1,
          limit: exportLimit,
          sort_by: toApiSortField(sortField),
          sort_order: sortAsc ? 'ASC' : 'DESC',
          search: debouncedSearch || undefined,
          dental_preset_id: presetFilter === 'all' ? undefined : presetFilter,
        });

        if (!result?.measurements?.length) {
          showDentalErrorNotification(
            servicesManager,
            'Export failed',
            'Could not load measurements to export. Please try again.'
          );
          return;
        }

        const measurements = result.measurements.map(saved => ({
          id: saved.id,
          label: saved.label,
          value: saved.value,
          unit: saved.unit,
          tool: saved.tool,
          captured_at: saved.captured_at,
          dental_preset_id: saved.dental_preset_id,
          coordinates: saved.coordinates,
        }));
        downloadMeasurementsJson(studyInstanceUID, measurements);
        showDentalSuccessNotification(
          servicesManager,
          'Measurements exported',
          `Downloaded ${measurements.length} measurement${measurements.length === 1 ? '' : 's'} as JSON.`
        );
        return;
      }

      const measurements = offlineSortedMeasurements.map(mapMeasurementToExport);
      if (!measurements.length) {
        showDentalErrorNotification(
          servicesManager,
          'Export failed',
          'No measurements available to export.'
        );
        return;
      }

      downloadMeasurementsJson(studyInstanceUID || 'unknown', measurements);
      showDentalSuccessNotification(
        servicesManager,
        'Measurements exported',
        `Downloaded ${measurements.length} measurement${measurements.length === 1 ? '' : 's'} as JSON.`
      );
    } catch {
      showDentalErrorNotification(
        servicesManager,
        'Export failed',
        'Could not export measurements. Please try again.'
      );
    }
  };

  const handleSave = async () => {
    if (!studyInstanceUID || !hasAuthToken() || !hasUnsavedChanges) {
      return;
    }
    setSaveStatus('saving');
    try {
      const ok = await persistDentalMeasurements(studyInstanceUID, servicesManager);
      setSaveStatus(ok ? 'saved' : 'error');
      if (ok) {
        if (useApiList) {
          await loadMeasurementsPage();
        }
        showDentalSuccessNotification(
          servicesManager,
          'Measurements saved',
          'Your measurements were saved to the server.'
        );
      } else {
        showDentalErrorNotification(
          servicesManager,
          'Save failed',
          'Could not save measurements to the server. Please try again.'
        );
      }
    } catch {
      setSaveStatus('error');
      showDentalErrorNotification(
        servicesManager,
        'Save failed',
        'Could not save measurements to the server. Please try again.'
      );
    }
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const totalItems = paginationMeta?.total ?? 0;
  const exportableCount = useApiList ? totalItems : offlineSortedMeasurements.length;
  const hasExportableData = exportableCount > 0;

  const hasUnsavedChanges = useMemo(() => {
    const { measurementService } = servicesManager.services;
    return hasUnsavedMeasurementChanges(
      measurementService,
      persistenceState.serverMeasurements,
      persistenceState.syncedSaveFingerprint
    );
  }, [
    servicesManager,
    liveMeasurements,
    persistenceState.serverMeasurements,
    persistenceState.syncedSaveFingerprint,
  ]);

  const isPersistenceReady =
    !!studyInstanceUID &&
    persistenceState.loaded_study_instance_uid === studyInstanceUID &&
    persistenceState.syncStatus !== 'syncing' &&
    persistenceState.measurementsBaselineReady;

  const canSaveToServer =
    hasAuthToken() && isPersistenceReady && hasUnsavedChanges && saveStatus !== 'saving';

  const countLabel =
    totalItems === 0
      ? '0 items'
      : hasActiveFilters
        ? `${totalItems} matching item${totalItems === 1 ? '' : 's'}`
        : `${totalItems} item${totalItems === 1 ? '' : 's'}`;

  const emptyMessage = hasActiveFilters
    ? 'No items match the current filters'
    : 'No items';

  const showListLoader = useApiList && showDelayedListLoading && displayMeasurements.length === 0;
  const showListReloadOverlay = useApiList && showDelayedListLoading && displayMeasurements.length > 0;

  return {
    filterText,
    setFilterText,
    presetFilter,
    setPresetFilter,
    sortField,
    setSortField,
    sortAsc,
    setSortAsc,
    saveStatus,
    selectedUids,
    selectedVisibleCount,
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    editDialogOpen,
    setEditDialogOpen,
    isDeleting,
    isSavingEdits,
    page,
    setPage,
    pageSize,
    setPageSize,
    filtersExpanded,
    setFiltersExpanded: setFiltersExpandedWithUpdater,
    displayMeasurements,
    paginationMeta,
    pageOffset,
    selectAllState,
    hasActiveFilters,
    clearFilters,
    handleToggleSelect,
    handleToggleSelectAll,
    handleSaveEdits,
    handleConfirmDelete,
    handleExport,
    handleSave,
    hasExportableData,
    canSaveToServer,
    countLabel,
    emptyMessage,
    showListLoader,
    showListReloadOverlay,
    editDialogItems,
    hasAuthToken: hasAuthToken(),
    isPersistenceReady,
    hasUnsavedChanges,
  };
}

export { useMeasurementsPanel };
export type { SortField, PresetFilter };
