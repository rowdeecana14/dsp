/**
 * Dental Extension Customizations
 * Registers dental-specific customizations with OHIF
 */

import React from 'react';
import PracticeHeader from './panels/PracticeHeader';
import MeasurementsPalette from './panels/MeasurementsPalette';
import MeasurementsPanel from './panels/MeasurementsPanel';
import dentalThemeCustomization from './constants/dentalTheme';

export default function getCustomizationModule({ servicesManager, extensionManager }) {
  return [
    {
      name: 'dentalTheme',
      value: dentalThemeCustomization,
    },
    {
      name: 'practiceHeader',
      value: {
        'header.component': {
          $set: PracticeHeader,
        },
      },
    },
    {
      name: 'measurementsPalette',
      value: {
        'panels.overlay': {
          $push: [MeasurementsPalette],
        },
      },
    },
    {
      name: 'measurementsPanel',
      value: {
        'panels.right': {
          $push: [MeasurementsPanel],
        },
      },
    },
  ];
}
