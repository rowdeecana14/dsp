/**
 * @ohif/extension-dental
 *
 * Dental Mode Extension for OHIF Viewer
 * Provides dental-specific UI customizations, measurements, and workflow
 */

import dentalModeFactory from './modes/dental-mode';
import getCustomizationModule from './getCustomizationModule';

export default {
  // Mode definition
  modeModule: {
    name: 'dental',
    defaultExport: dentalModeFactory,
  },
  
  // Customization module
  customizationModule: {
    name: 'dentalCustomization',
    defaultExport: getCustomizationModule,
  },
};
