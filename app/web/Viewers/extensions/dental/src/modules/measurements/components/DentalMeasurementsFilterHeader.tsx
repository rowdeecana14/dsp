import React from 'react';
import { Icons, Tooltip, TooltipContent, TooltipTrigger } from '@ohif/ui-next';

type DentalMeasurementsFilterHeaderProps = {
  filtersExpanded: boolean;
  onToggleFilters: () => void;
  sortAsc: boolean;
  onToggleSort: () => void;
  hasActiveFilters?: boolean;
};

function DentalMeasurementsFilterHeader({
  filtersExpanded,
  onToggleFilters,
  sortAsc,
  onToggleSort,
  hasActiveFilters = false,
}: DentalMeasurementsFilterHeaderProps) {
  return (
    <div className="bg-muted flex h-[40px] select-none p-2">
      <div className="flex h-[24px] w-full select-none justify-center self-center text-[14px]">
        <div className="flex w-full items-center gap-[10px]">
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-primary flex items-center"
                  onClick={onToggleFilters}
                  aria-expanded={filtersExpanded}
                  aria-label={filtersExpanded ? 'Hide filters' : 'Show filters'}
                  data-cy="dental-toggle-filters"
                >
                  <Icons.Settings
                    className={
                      filtersExpanded || hasActiveFilters
                        ? 'cursor-pointer opacity-100'
                        : 'cursor-pointer opacity-70'
                    }
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {filtersExpanded ? 'Hide search and filters' : 'Show search and filters'}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="ml-auto flex h-full items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-primary flex h-[24px] w-[24px] items-center justify-center"
                  onClick={onToggleSort}
                  aria-label={sortAsc ? 'Sort ascending' : 'Sort descending'}
                  data-cy="dental-toggle-sort-direction"
                >
                  {sortAsc ? (
                    <Icons.SortingAscending className="w-3" />
                  ) : (
                    <Icons.SortingDescending className="w-3" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {sortAsc ? 'Ascending' : 'Descending'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DentalMeasurementsFilterHeader;
