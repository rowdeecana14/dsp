import React from 'react';
import { DentalMeasurementsPanel } from '../../modules/measurements';

const getPanelModule = () => {
  return [
    {
      name: 'dentalMeasurements',
      iconName: 'tool-length',
      iconLabel: 'Dental Measurements',
      label: 'Measurements',
      component: () => (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <DentalMeasurementsPanel />
        </div>
      ),
    },
  ];
};

export default getPanelModule;
