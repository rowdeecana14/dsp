import React, { useEffect, useMemo, useState } from 'react';

import { useAppConfig } from '@state';
import { preserveQueryParameters } from '../../utils/preserveQueryParameters';
import { useStudyListStateSync, useWorkListToolbarActions } from '../../hooks';

import { StudyList, Icons, InvestigationalUseDialog, type StudyRow } from '@ohif/ui-next';
import { StudyListSettingsPopover } from './StudyListSettingsPopover';
import { SidePanelPreview } from './SidePanelPreview';

type Props = withAppTypes & {
  data: any[];
  dataSource: any;
  isLoadingData: boolean;
  hasFetchedOnce?: boolean;
  dataPath?: string;
  onRefresh: () => void;
};

export default function WorkList({
  data,
  dataSource,
  isLoadingData,
  hasFetchedOnce = false,
  dataPath,
  onRefresh,
  servicesManager,
  extensionManager,
}: Props) {
  const [appConfig] = useAppConfig();
  const { customizationService } = servicesManager.services;
  const LoadingIndicatorProgress = customizationService.getCustomization(
    'ui.loadingIndicatorProgress'
  ) as React.ComponentType<{ className?: string }> | undefined;
  const [isFilterPending, setIsFilterPending] = useState(false);
  const showStudyListLoading = Boolean(
    (appConfig.showLoadingIndicator && isLoadingData) || !hasFetchedOnce || isFilterPending
  );

  // Sync table state (sorting, pagination, filters) with URL and sessionStorage
  const { sorting, pagination, filters, setSorting, setPagination, setFilters } =
    useStudyListStateSync();

  // Default sorting if no URL state exists
  const defaultSorting = useMemo(() => [{ id: 'studyDateTime', desc: true }], []);

  const [selected, setSelected] = useState<StudyRow | null>(null);
  const [isPreviewOpen, setPreviewOpen] = useState(true);

  const columns = useMemo(() => {
    // `workList.columns` is registered as a value (StudyList.defaultColumns) and
    // merged via customization commands, so we read the result directly.
    const customized = customizationService.getCustomization('workList.columns');
    return Array.isArray(customized) ? customized : StudyList.defaultColumns;
  }, [customizationService]);

  const HeaderComponent = customizationService.getCustomization(
    'workList.headerComponent'
  ) as React.ComponentType | undefined;

  const useDentalPracticeHeader = Boolean(HeaderComponent);

  const ToolbarLeftComponent = customizationService.getCustomization(
    'workList.toolbarLeftComponent'
  ) as React.ComponentType | undefined;

  const logoComponent =
    !useDentalPracticeHeader && ToolbarLeftComponent ? (
      <ToolbarLeftComponent />
    ) : !useDentalPracticeHeader ? (
      appConfig?.whiteLabeling?.createLogoComponentFn?.(React) ?? (
        <Icons.OHIFLogoHorizontal
          aria-label="OHIF logo"
          className="h-[22px] w-[232px]"
        />
      )
    ) : undefined;

  const studyListTitle = useDentalPracticeHeader
    ? undefined
    : (appConfig as { dentalPracticeName?: string } | undefined)?.dentalPracticeName ??
      'Study List';

  const toolbarActions = useWorkListToolbarActions(servicesManager, dataSource, onRefresh);

  const previewDefaultSize = useMemo(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 0) {
      const percent = (325 / window.innerWidth) * 100;
      return Math.min(Math.max(percent, 15), 50);
    }
    return 30;
  }, []);

  useEffect(() => {
    if (isLoadingData) {
      return;
    }
    setIsFilterPending(false);
  }, [isLoadingData, data]);

  return (
    <div className="bg-background flex h-screen min-h-0 flex-col overflow-hidden">
      <InvestigationalUseDialog dialogConfiguration={appConfig?.investigationalUseDialog} />
      {HeaderComponent ? <HeaderComponent /> : null}
      <div className="flex min-h-0 flex-1 flex-col">
          <StudyList
            loadedModes={appConfig?.loadedModes ?? []}
            defaultWorkflowModeId={
              (appConfig as { defaultWorkflowModeId?: string } | undefined)
                ?.defaultWorkflowModeId
            }
            preserveQueryParameters={preserveQueryParameters}
            dataPath={dataPath}
            isPreviewOpen={isPreviewOpen}
            onIsPreviewOpenChange={setPreviewOpen}
            defaultPreviewSizePercent={previewDefaultSize}
            className="h-full w-full"
          >
            <StudyList.Table
              columns={columns}
              data={data as StudyRow[]}
              sorting={sorting.length > 0 ? sorting : defaultSorting}
              pagination={pagination}
              filters={filters}
              onSortingChange={setSorting}
              onPaginationChange={setPagination}
              onFiltersChange={updater => {
                setIsFilterPending(true);
                setFilters(updater);
              }}
              isLoading={showStudyListLoading}
              loadingComponent={
                LoadingIndicatorProgress ? (
                  <LoadingIndicatorProgress className="bg-background !relative" />
                ) : (
                  <div className="h-8 w-8" />
                )
              }
              title={studyListTitle}
              onSelectionChange={sel => setSelected((sel as StudyRow[])[0] ?? null)}
              toolbarLeftComponent={logoComponent}
              toolbarRightActionsComponent={toolbarActions}
              toolbarRightComponent={
                !isPreviewOpen ? (
                  <div className="relative -top-px mt-1 ml-2 flex items-center gap-1">
                    {!useDentalPracticeHeader ? <StudyListSettingsPopover /> : null}
                    <StudyList.OpenPreviewButton />
                  </div>
                ) : undefined
              }
            />
            <StudyList.Preview>
              <SidePanelPreview
                dataSource={dataSource}
                selected={selected}
                servicesManager={servicesManager}
              />
            </StudyList.Preview>
          </StudyList>
      </div>
    </div>
  );
}

