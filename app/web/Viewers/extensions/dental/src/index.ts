import { id } from './id';
import getPanelModule from './getPanelModule';
import getCommandsModule, { initDentalMeasurementTracking } from './getCommandsModule';
import getToolbarModule from './getToolbarModule';
import getHangingProtocolModule from './getHangingProtocolModule';
import getLayoutTemplateModule from './getLayoutTemplateModule';
import getCustomizationModule from './getCustomizationModule';
import './styles/dental-theme.css';

export default {
  id,
  preRegistration({ servicesManager, commandsManager }) {
    initDentalMeasurementTracking(servicesManager);
    commandsManager.runCommand('loadDentalViewerState');
  },
  getPanelModule,
  getCommandsModule,
  getToolbarModule,
  getHangingProtocolModule,
  getLayoutTemplateModule,
  getCustomizationModule,
};

export { id };
