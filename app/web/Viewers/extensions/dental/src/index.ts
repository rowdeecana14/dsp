import { Types } from '@ohif/core';
import { ActiveThemeProvider } from '@ohif/ui-next';

import { id } from './id';
import DentalAuthBootstrapProvider from './app/providers/DentalAuthBootstrapProvider';
import { initializeDentalBranding } from './shared/utils/dentalBranding';
import getHangingProtocolModule from './app/modules/getHangingProtocolModule';
import getCustomizationModule from './app/modules/getCustomizationModule';
import getPanelModule from './app/modules/getPanelModule';
import getCommandsModule from './app/modules/getCommandsModule';
import getToolbarModule from './app/modules/getToolbarModule';
import getLayoutTemplateModule from './app/modules/getLayoutTemplateModule';
import isBitewingSeries from './custom-attributes/isBitewingSeries';
import bitewingSide from './custom-attributes/bitewingSide';
import sameModalityAsCurrent from './custom-attributes/sameModalityAsCurrent';

const dentalExtension: Types.Extensions.Extension = {
  id,

  preRegistration: ({ servicesManager, serviceProvidersManager, appConfig }: Types.Extensions.ExtensionParams) => {
    initializeDentalBranding(appConfig as { dentalPracticeName?: string; dentalPracticeLogo?: string });

    const { hangingProtocolService, measurementService } = servicesManager.services;
    measurementService.addMeasurementSchemaKeys('dentalPresetId');

    hangingProtocolService.addCustomAttribute(
      'isBitewingSeries',
      'Whether the series is a bitewing',
      isBitewingSeries
    );
    hangingProtocolService.addCustomAttribute(
      'bitewingSide',
      'Left or right bitewing side',
      bitewingSide
    );
    hangingProtocolService.addCustomAttribute(
      'sameModalityAsCurrent',
      'Same modality as current viewport series',
      sameModalityAsCurrent
    );

    // Dental UI (ThemeToggle, DentalThemeBridge, viewer state restore) always calls
    // useActiveTheme, so register the provider unconditionally — not only when the
    // theme customization module is listed in app config.
    serviceProvidersManager.registerProvider('activeTheme', ActiveThemeProvider);

    const dentalApiUrl = (appConfig as { dentalApiUrl?: string } | undefined)?.dentalApiUrl;
    const hasOidc = Array.isArray(appConfig?.oidc) && appConfig.oidc.length > 0;
    if (dentalApiUrl && !hasOidc) {
      serviceProvidersManager.registerProvider('dentalAuthBootstrap', DentalAuthBootstrapProvider);
    }
  },

  getHangingProtocolModule,
  getCustomizationModule,
  getPanelModule,
  getCommandsModule,
  getToolbarModule,
  getLayoutTemplateModule,
};

export default dentalExtension;
