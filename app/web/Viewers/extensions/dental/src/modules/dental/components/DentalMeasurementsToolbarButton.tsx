import React from 'react';
import { Popover, PopoverAnchor, PopoverContent, ToolButton } from '@ohif/ui-next';
import MeasurementsPalette from './MeasurementsPalette';

type DentalMeasurementsToolbarButtonProps = {
  id?: string;
  tooltip?: string;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  disabled?: boolean;
};

function DentalMeasurementsToolbarButton({
  id = 'DentalMeasurements',
  tooltip = 'Dental measurement presets',
  isOpen = false,
  onOpen,
  onClose,
  disabled = false,
}: DentalMeasurementsToolbarButtonProps) {
  const handleOpenChange = (open: boolean) => {
    if (open) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <PopoverAnchor asChild>
        <span className="inline-flex">
          <ToolButton
            id={id}
            icon="tool-length"
            label="Measurements"
            tooltip={tooltip}
            isToggled={isOpen}
            disabled={disabled}
            onInteraction={() => handleOpenChange(!isOpen)}
          />
        </span>
      </PopoverAnchor>
      <PopoverContent
        className="border-border w-auto border p-0 shadow-lg"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <MeasurementsPalette onClose={() => handleOpenChange(false)} />
      </PopoverContent>
    </Popover>
  );
}

export default DentalMeasurementsToolbarButton;
