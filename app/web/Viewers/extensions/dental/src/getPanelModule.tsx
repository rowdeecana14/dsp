import React from 'react';
import DentalMeasurementsPanel from './components/DentalMeasurementsPanel';

const getPanelModule = () => {
  const WrappedPanel = () => <DentalMeasurementsPanel />;

  return [
    {
      name: 'dentalMeasurements',
      iconName: 'tool-length',
      iconLabel: 'Dental Measurements',
      label: 'Dental Measurements',
      component: WrappedPanel,
    },
  ];
};

export default getPanelModule;
