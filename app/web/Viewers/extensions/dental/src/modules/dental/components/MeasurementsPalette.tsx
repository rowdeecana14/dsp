import React from 'react';
import {
  DENTAL_MEASUREMENT_PRESETS,
  setActiveDentalPreset,
} from '../store/dental.store';
import type { DentalMeasurementPreset } from '../store/measurementPresets';
import { useMeasurementActions } from '../../measurements';

type MeasurementsPaletteProps = {
  onClose?: () => void;
};

function MeasurementsPalette({ onClose }: MeasurementsPaletteProps) {
  const { activateTool } = useMeasurementActions([]);

  const activatePreset = (preset: DentalMeasurementPreset) => {
    setActiveDentalPreset(preset);
    activateTool(preset.toolName);
    onClose?.();
  };

  return (
    <div
      className="flex flex-col gap-1 p-2"
      data-cy="dental-measurements-palette"
    >
      {DENTAL_MEASUREMENT_PRESETS.map(preset => (
        <button
          key={preset.id}
          type="button"
          className="hover:bg-muted/60 rounded px-3 py-2 text-left text-sm"
          onClick={() => activatePreset(preset)}
          data-cy={`dental-preset-${preset.id}`}
        >
          <span className="font-medium">{preset.label}</span>
          <span className="text-muted-foreground ml-2 text-xs">
            {preset.toolName} · {preset.unit}
          </span>
        </button>
      ))}
    </div>
  );
}

export default MeasurementsPalette;
