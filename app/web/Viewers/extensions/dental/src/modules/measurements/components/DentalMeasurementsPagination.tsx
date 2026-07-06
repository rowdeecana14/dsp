import React from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icons,
} from '@ohif/ui-next';
import { dentalPanelMetaTextClassName } from '../../../shared/components/dentalPanelStyles';

export const DENTAL_MEASUREMENTS_PAGE_SIZES = [5, 10, 20] as const;
export { DENTAL_MEASUREMENTS_DEFAULT_PAGE_SIZE } from '../store/measurement.store';

type DentalMeasurementsPaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

function DentalMeasurementsPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DentalMeasurementsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);
  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <div
      className="border-border/60 bg-background flex shrink-0 items-center justify-between gap-2 border-t px-3 py-2"
      data-cy="dental-measurements-pagination"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`${dentalPanelMetaTextClassName} hover:text-neutral-light h-auto px-0 text-[11px] font-medium`}
            aria-label="Rows per page"
            data-cy="dental-pagination-range"
          >
            {totalItems === 0 ? '0 items' : `${start}–${end} of ${totalItems}`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="border-border/60 min-w-[8rem]"
        >
          {DENTAL_MEASUREMENTS_PAGE_SIZES.map(size => (
            <DropdownMenuItem
              key={size}
              onSelect={event => {
                event.preventDefault();
                onPageSizeChange(size);
              }}
              className="flex items-center gap-1"
              data-cy={`dental-page-size-${size}`}
            >
              <Icons.Checked className={`h-4 w-4 ${pageSize === size ? 'text-primary' : 'invisible'}`} />
              <span className="text-xs">{size} per page</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1">
        <span className={`${dentalPanelMetaTextClassName} mr-1 text-[10px] tabular-nums`}>
          {safePage}/{totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral hover:text-neutral-light h-7 w-7"
          aria-label="Previous page"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canPrev}
          data-cy="dental-pagination-prev"
        >
          <Icons.ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral hover:text-neutral-light h-7 w-7"
          aria-label="Next page"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canNext}
          data-cy="dental-pagination-next"
        >
          <Icons.ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default DentalMeasurementsPagination;
