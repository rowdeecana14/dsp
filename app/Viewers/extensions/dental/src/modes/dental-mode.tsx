/**
 * Dental Mode Factory
 * Defines the dental workflow mode for OHIF
 */

import { id } from './id';

function dentalModeFactory({ modeConfiguration }) {
  return {
    // Mode Identity
    id: 'dental',
    routeName: 'dental',
    displayName: 'Dental Mode',
    
    // Lifecycle hooks
    onModeEnter({ servicesManager, extensionManager, commandsManager }) {
      const {
        toolbarService,
        customizationService,
        workflowStepsService,
        hangingProtocolService,
      } = servicesManager.services;

      // Register dental toolbar buttons
      // TODO: Register dental-specific measurement buttons

      // Set dental customizations
      customizationService.setCustomizations({
        'theme': { $set: 'dental' },
      });

      // Setup hanging protocol for dental
      // TODO: Register dental 2x2 hanging protocol
    },

    onSetupRouteComplete({ servicesManager }) {
      // Called after routes are set up
      // Initialize workflow steps if needed
      const { workflowStepsService } = servicesManager.services;
      // TODO: Setup dental workflow steps
    },

    onModeExit({ servicesManager }) {
      // Cleanup when exiting dental mode
      const { customizationService } = servicesManager.services;
      customizationService.setCustomizations({
        'theme': { $set: 'default' },
      });
    },

    // Extension dependencies
    extensions: {
      '@ohif/extension-default': '*',
      '@ohif/extension-cornerstone': '*',
    },

    // Routes
    routes: [
      {
        path: 'dental',
        layoutTemplate: ({ location, servicesManager }) => {
          return {
            id: '@ohif/extension-default.layoutTemplateModule.viewerLayout',
            props: {
              leftPanels: ['@ohif/extension-default.panelModule.seriesList'],
              rightPanels: ['@ohif/extension-dental.panelModule.measurementsPanel'],
              viewports: [
                // 2x2 dental layout
                { row: 0, col: 0 }, // Current image
                { row: 0, col: 1 }, // Prior exam
                { row: 1, col: 0 }, // Bitewing placeholder
                { row: 1, col: 1 }, // Bitewing placeholder
              ],
            },
          };
        },
      },
    ],

    // Hanging protocol
    hangingProtocol: 'dental-2x2',

    // SOP class handlers
    sopClassHandlers: ['@ohif/extension-default.sopClassHandlerModule.stack'],

    // Display sets
    displaySetService: {
      activeDisplaySets: [],
    },
  };
}

export default dentalModeFactory;
