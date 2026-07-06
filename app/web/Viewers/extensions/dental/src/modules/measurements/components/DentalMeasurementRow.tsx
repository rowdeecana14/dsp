import React from 'react';
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icons,
} from '@ohif/ui-next';
import classNames from 'classnames';
import { resolveDentalMeasurementLabel } from '../../dental';
import { dentalPanelCheckboxClassName, dentalPanelBodyTextClassName } from '../../../shared/components/dentalPanelStyles';

type DentalMeasurementRowProps = {
  item: Record<string, unknown>;
  index: number;
  isChecked: boolean;
  isActive?: boolean;
  onToggleSelect: (checked: boolean) => void;
  onJump: () => void;
  onRename: () => void;
  onDelete: () => void;
};

function extractPrimaryValue(item: Record<string, unknown>): string {
  const displayText = item.displayText as { primary?: string[] } | undefined;
  if (displayText?.primary?.length) {
    return displayText.primary.filter(Boolean).join(' ');
  }

  const unit = String((item as { unit?: string }).unit ?? '').trim();
  return unit ? `— ${unit}` : '';
}

function DentalMeasurementRow({
  item,
  index,
  isChecked,
  isActive = false,
  onToggleSelect,
  onJump,
  onRename,
  onDelete,
}: DentalMeasurementRowProps) {
  const label = resolveDentalMeasurementLabel(item);
  const value = extractPrimaryValue(item);

  return (
    <div
      className={classNames(
        'group flex min-h-[3.5rem] w-full items-stretch overflow-hidden rounded-md border transition-colors',
        isActive
          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
          : isChecked
            ? 'border-primary/50 bg-accent'
            : 'border-border/50 bg-card hover:border-border hover:bg-accent'
      )}
      data-cy={`dental-measurement-row-${index}`}
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5"
        onClick={onJump}
        role="button"
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onJump();
          }
        }}
      >
        <div
          className="flex shrink-0 items-center py-0.5 pr-0.5"
          onClick={event => event.stopPropagation()}
        >
          <Checkbox
            checked={isChecked}
            onCheckedChange={checked => onToggleSelect(checked === true)}
            onClick={event => event.stopPropagation()}
            aria-label={`Select ${label}`}
            data-cy={`dental-measurement-select-${index}`}
            className={dentalPanelCheckboxClassName}
          />
        </div>

        <div
          className={classNames(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums',
            'bg-primary/20 text-primary'
          )}
        >
          {index + 1}
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <p
            className="text-primary truncate text-xs font-medium leading-tight"
            data-cy="dental-measurement-label"
          >
            {label}
          </p>
          {value ? (
            <p
              className={`${dentalPanelBodyTextClassName} truncate text-sm font-semibold leading-snug`}
              data-cy="dental-measurement-value"
            >
              {value}
            </p>
          ) : (
            <p className="text-neutral text-[10px] leading-snug">No value</p>
          )}
        </div>
      </div>

      <div
        className="border-border/40 flex w-9 shrink-0 items-center justify-center border-l"
        onClick={event => event.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral hover:text-neutral-light hover:bg-muted/40 h-8 w-8 transition-colors group-hover:text-neutral-light data-[state=open]:text-neutral-light"
              aria-label={`Actions for ${label}`}
              data-cy={`dental-measurement-actions-${index}`}
            >
              <Icons.More className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-border/60 min-w-[9rem]"
          >
            <DropdownMenuItem
              onSelect={() => onRename()}
              data-cy="Rename"
            >
              <Icons.Rename className="text-foreground h-4 w-4" />
              <span className="pl-2 text-xs">Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onDelete()}
              className="text-destructive focus:text-destructive"
              data-cy="Delete"
            >
              <Icons.Delete className="h-4 w-4" />
              <span className="pl-2 text-xs">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default DentalMeasurementRow;
