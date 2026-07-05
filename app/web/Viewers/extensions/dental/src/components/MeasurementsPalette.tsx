import React from 'react';
import { Button } from '@ohif/ui-next';

export interface MeasurementPreset {
  id: string;
  label: string;
  tool: string;
  unit: string;
  description: string;
}

export const DENTAL_MEASUREMENT_PRESETS: MeasurementPreset[] = [
  {
    id: 'pa-length',
    label: 'PA length',
    tool: 'Length',
    unit: 'mm',
    description: 'Periapical length measurement',
  },
  {
    id: 'canal-angle',
    label: 'Canal angle',
    tool: 'Angle',
    unit: '°',
    description: 'Root canal angle',
  },
  {
    id: 'crown-width',
    label: 'Crown width',
    tool: 'Length',
    unit: 'mm',
    description: 'Crown width at widest point',
  },
  {
    id: 'root-length',
    label: 'Root length',
    tool: 'Length',
    unit: 'mm',
    description: 'Root length from CEJ to apex',
  },
];

interface MeasurementsPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: MeasurementPreset) => void;
}

export default function MeasurementsPalette({ isOpen, onClose, onSelectPreset }: MeasurementsPaletteProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="border-dental-accent/30 bg-popover absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border p-3 shadow-lg"
      data-cy="measurements-palette"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-dental-accent text-sm font-semibold">Dental Measurements</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        {DENTAL_MEASUREMENT_PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            className="hover:bg-dental-accent/10 rounded-md px-3 py-2 text-left transition-colors"
            onClick={() => {
              onSelectPreset(preset);
              onClose();
            }}
            data-cy={`preset-${preset.id}`}
          >
            <div className="text-sm font-medium">{preset.label}</div>
            <div className="text-dental-muted text-xs">
              {preset.description} ({preset.unit})
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
