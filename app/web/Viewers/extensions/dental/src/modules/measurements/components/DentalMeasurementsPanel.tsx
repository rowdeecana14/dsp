import React from 'react';
import {
  Button,
  Icons,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@ohif/ui-next';
import DentalMeasurementList from './DentalMeasurementList';
import DentalCheckboxLabel from './DentalCheckboxLabel';
import DeleteMeasurementsDialog from './DeleteMeasurementsDialog';
import EditMeasurementsDialog from './EditMeasurementsDialog';
import DentalMeasurementsPagination from './DentalMeasurementsPagination';
import DentalMeasurementsFilterHeader from './DentalMeasurementsFilterHeader';
import { DentalPanelLoader } from '../../../shared';
import { DENTAL_MEASUREMENT_PRESETS } from '../../dental';
import { useMeasurementsPanel } from '../hooks/useMeasurementsPanel';
import type { SortField } from '../hooks/useMeasurementsPanel';
import {
  dentalPanelDestructiveTextActionClassName,
  dentalPanelMetaTextClassName,
  dentalPanelSectionClassName,
  dentalPanelScrollAreaClassName,
  dentalPanelSelectTriggerClassName,
  dentalPanelTextActionClassName,
} from '../../../shared/components/dentalPanelStyles';

function DentalMeasurementsPanel() {
  const panel = useMeasurementsPanel();

  return (
    <div
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
      data-cy="dental-measurements-panel"
    >
      <div className="border-border/60 flex flex-col gap-2 border-b px-3 py-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-8 w-full text-xs"
            onClick={() => void panel.handleExport()}
            disabled={!panel.hasExportableData}
            title={
              panel.hasExportableData
                ? 'Download measurements as JSON'
                : 'No measurements to export'
            }
            data-cy="export-json-btn"
          >
            Export JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-secondary-foreground h-8 w-full text-xs"
            onClick={panel.handleSave}
            disabled={!panel.canSaveToServer}
            title={
              !panel.hasAuthToken
                ? 'Sign in to save measurements'
                : !panel.isPersistenceReady
                  ? 'Loading measurements from server'
                  : !panel.hasUnsavedChanges
                    ? 'No unsaved changes'
                    : 'Save to server'
            }
            data-cy="save-server-btn"
          >
            {panel.saveStatus === 'saving' ? (
              <span className="inline-flex items-center justify-center gap-1.5">
                <Icons.LoadingSpinner className="h-3.5 w-3.5" />
                Saving…
              </span>
            ) : panel.saveStatus === 'saved' ? (
              'Saved!'
            ) : panel.saveStatus === 'error' ? (
              'Failed'
            ) : (
              'Save to Server'
            )}
          </Button>
        </div>

        <p
          className={`${dentalPanelMetaTextClassName} text-[11px] leading-none`}
          data-cy="dental-measurement-count"
        >
          {panel.countLabel}
        </p>

        {!panel.hasAuthToken && (
          <p className={`${dentalPanelMetaTextClassName} text-[10px] leading-relaxed`}>
            Sign in to save measurements to the server.
          </p>
        )}
      </div>

      <DentalMeasurementsFilterHeader
        filtersExpanded={panel.filtersExpanded}
        onToggleFilters={() => panel.setFiltersExpanded(expanded => !expanded)}
        sortAsc={panel.sortAsc}
        onToggleSort={() => panel.setSortAsc(value => !value)}
        hasActiveFilters={panel.hasActiveFilters}
      />
      <Separator
        orientation="horizontal"
        className="bg-background"
        thickness="2px"
      />

      {panel.filtersExpanded && (
        <div className="border-border/60 flex flex-col gap-2 border-b px-3 py-2">
          <Input
            type="text"
            placeholder="Search label, value, tool..."
            className="h-8 text-xs"
            value={panel.filterText}
            onChange={e => panel.setFilterText(e.target.value)}
            data-cy="dental-measurement-search"
          />

          <Select
            value={panel.presetFilter}
            onValueChange={panel.setPresetFilter}
          >
            <SelectTrigger
              className={dentalPanelSelectTriggerClassName}
              aria-label="Filter by preset"
              data-cy="dental-preset-filter"
            >
              <SelectValue placeholder="All presets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All presets</SelectItem>
              {DENTAL_MEASUREMENT_PRESETS.map(preset => (
                <SelectItem
                  key={preset.id}
                  value={preset.id}
                >
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={panel.sortField}
            onValueChange={value => panel.setSortField(value as SortField)}
          >
            <SelectTrigger
              className={dentalPanelSelectTriggerClassName}
              aria-label="Sort measurements"
              data-cy="dental-sort-field"
            >
              <SelectValue placeholder="Sort field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="label">Sort: Label</SelectItem>
              <SelectItem value="value">Sort: Value</SelectItem>
              <SelectItem value="date">Sort: Date</SelectItem>
            </SelectContent>
          </Select>

          {panel.hasActiveFilters && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-primary h-auto self-start px-0 text-[10px] font-medium leading-none"
              onClick={panel.clearFilters}
              data-cy="dental-clear-filters"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      <div className={`${dentalPanelScrollAreaClassName} relative`}>
        {panel.showListReloadOverlay ? (
          <div
            className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]"
            data-cy="dental-measurements-loading-overlay"
          >
            <DentalPanelLoader
              label="Loading measurements…"
              compact
            />
          </div>
        ) : null}
        <ScrollArea className="h-full">
          <div className="px-3 pb-3 pt-2">
            {panel.showListLoader ? (
              <div className={`${dentalPanelSectionClassName} overflow-hidden`}>
                <DentalPanelLoader label="Loading measurements…" />
              </div>
            ) : panel.displayMeasurements.length === 0 ? (
              <div
                className={`${dentalPanelSectionClassName} ${dentalPanelMetaTextClassName} flex min-h-[7rem] items-center justify-center px-4 py-6 text-center text-xs`}
              >
                {panel.emptyMessage}
              </div>
            ) : (
              <div className={`${dentalPanelSectionClassName} overflow-hidden`}>
                <div className="border-border/50 flex items-center justify-between gap-3 border-b px-3 py-2">
                  <DentalCheckboxLabel
                    id="dental-select-all"
                    checked={panel.selectAllState}
                    onCheckedChange={() => panel.handleToggleSelectAll()}
                    label="Select all"
                    data-cy="dental-select-all"
                  />
                  <div className="flex shrink-0 items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        panel.selectedVisibleCount > 0
                          ? `${dentalPanelTextActionClassName} text-primary hover:text-primary`
                          : dentalPanelTextActionClassName
                      }
                      disabled={panel.selectedVisibleCount === 0 || panel.isSavingEdits}
                      onClick={() => panel.setEditDialogOpen(true)}
                      data-cy="dental-edit-selected"
                    >
                      {panel.isSavingEdits ? 'Saving…' : 'Edit'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        panel.selectedVisibleCount > 0
                          ? `${dentalPanelDestructiveTextActionClassName} text-destructive hover:text-destructive`
                          : dentalPanelDestructiveTextActionClassName
                      }
                      disabled={panel.selectedVisibleCount === 0 || panel.isDeleting}
                      onClick={() => panel.setConfirmDeleteOpen(true)}
                      data-cy="dental-delete-selected"
                    >
                      {panel.isDeleting ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 p-2">
                  <DentalMeasurementList
                    items={panel.displayMeasurements}
                    pageOffset={panel.pageOffset}
                    selectedUids={panel.selectedUids}
                    onToggleSelect={panel.handleToggleSelect}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {(panel.paginationMeta?.total ?? 0) > 0 || panel.displayMeasurements.length > 0 ? (
        <DentalMeasurementsPagination
          page={panel.paginationMeta?.page ?? panel.page}
          pageSize={panel.paginationMeta?.limit ?? panel.pageSize}
          totalItems={Math.max(panel.paginationMeta?.total ?? 0, panel.displayMeasurements.length)}
          onPageChange={panel.setPage}
          onPageSizeChange={size => {
            panel.setPageSize(size);
            panel.setPage(1);
          }}
        />
      ) : null}

      <EditMeasurementsDialog
        open={panel.editDialogOpen}
        items={panel.editDialogItems}
        isSaving={panel.isSavingEdits}
        onOpenChange={panel.setEditDialogOpen}
        onSave={updates => void panel.handleSaveEdits(updates)}
      />

      <DeleteMeasurementsDialog
        open={panel.confirmDeleteOpen}
        count={panel.selectedVisibleCount}
        isDeleting={panel.isDeleting}
        onOpenChange={panel.setConfirmDeleteOpen}
        onConfirm={() => void panel.handleConfirmDelete()}
      />
    </div>
  );
}

export default DentalMeasurementsPanel;
