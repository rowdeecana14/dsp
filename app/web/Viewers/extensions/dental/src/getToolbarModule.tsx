import React, { useState } from 'react';
import { Button, Icons } from '@ohif/ui-next';
import MeasurementsPalette, { DENTAL_MEASUREMENT_PRESETS } from './components/MeasurementsPalette';

function DentalMeasurementsToolbarButton({ commandsManager }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="text-dental-accent gap-1"
        onClick={() => setIsOpen(v => !v)}
        data-cy="measurements-palette-btn"
      >
        <Icons.ToolLength className="h-4 w-4" />
        <span className="text-xs font-semibold">Measurements</span>
      </Button>
      <MeasurementsPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectPreset={preset => {
          commandsManager.runCommand('startDentalMeasurement', { presetId: preset.id });
        }}
      />
    </div>
  );
}

const getToolbarModule = ({ commandsManager }) => {
  const WrappedButton = () => <DentalMeasurementsToolbarButton commandsManager={commandsManager} />;

  return [
    {
      name: 'dental.measurementsPalette',
      defaultComponent: WrappedButton,
    },
  ];
};

export { DENTAL_MEASUREMENT_PRESETS };
export default getToolbarModule;
