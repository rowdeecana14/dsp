import update from 'immutability-helper';
import i18n from 'i18next';
import { ToolbarService } from '@ohif/core';
import { id } from './id';
import initToolGroups from './initToolGroups';
import toolbarButtons from './toolbarButtons';

const { TOOLBAR_SECTIONS } = ToolbarService;

const ohif = {
  layout: '@ohif/extension-dental.layoutTemplateModule.dentalViewerLayout',
  sopClassHandler: '@ohif/extension-default.sopClassHandlerModule.stack',
  thumbnailList: '@ohif/extension-default.panelModule.seriesList',
};

const cornerstone = {
  viewport: '@ohif/extension-cornerstone.viewportModule.cornerstone',
};

const dental = {
  measurements: '@ohif/extension-dental.panelModule.dentalMeasurements',
};

const dicomsr = {
  sopClassHandler: '@ohif/extension-cornerstone-dicom-sr.sopClassHandlerModule.dicom-sr',
  viewport: '@ohif/extension-cornerstone-dicom-sr.viewportModule.dicom-sr',
};

const extensionDependencies = {
  '@ohif/extension-default': '^3.0.0',
  '@ohif/extension-cornerstone': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-sr': '^3.0.0',
  '@ohif/extension-dental': '^3.0.0',
};

const modeInstance = {
  id,
  routeName: 'dental',
  displayName: i18n.t('Dental Mode'),
  hide: false,
  _activatePanelTriggersSubscriptions: [] as Array<{ unsubscribe: () => void }>,
  onModeEnter({
    servicesManager,
    extensionManager,
    commandsManager,
  }: withAppTypes) {
    const { measurementService, toolbarService, toolGroupService, customizationService } =
      servicesManager.services;

    measurementService.clearMeasurements();
    initToolGroups(extensionManager, toolGroupService, commandsManager);
    toolbarService.register(toolbarButtons);

    toolbarService.updateSection(TOOLBAR_SECTIONS.primary, [
      'DentalMeasurementsPalette',
      'MeasurementTools',
      'Zoom',
      'Pan',
      'WindowLevel',
      'Layout',
      'MoreTools',
    ]);

    toolbarService.updateSection(TOOLBAR_SECTIONS.measurementSection, ['Length', 'Angle']);

    toolbarService.updateSection(TOOLBAR_SECTIONS.moreToolsSection, ['Reset', 'StackScroll']);

    customizationService.setCustomizations(
      {
        'panelSegmentation.disableEditing': { $set: true },
      },
      'mode'
    );

    commandsManager.runCommand('applyDentalTheme', {}, 'DEFAULT');
    commandsManager.runCommand('initDentalMeasurementLabeling', {}, 'DEFAULT');
  },
  onModeExit({ servicesManager, commandsManager }: withAppTypes) {
    const {
      toolGroupService,
      syncGroupService,
      segmentationService,
      cornerstoneViewportService,
      uiDialogService,
      uiModalService,
    } = servicesManager.services;

    this._activatePanelTriggersSubscriptions.forEach(sub => sub.unsubscribe());
    this._activatePanelTriggersSubscriptions = [];

    commandsManager.runCommand('destroyDentalViewerSync', {}, 'DEFAULT');

    uiDialogService.hideAll();
    uiModalService.hide();
    toolGroupService.destroy();
    syncGroupService.destroy();
    segmentationService.destroy();
    cornerstoneViewportService.destroy();
  },
  validationTags: { study: [], series: [] },
  isValidMode: () => ({
    valid: true,
    description: 'Dental mode available for all studies',
  }),
  routes: [
    {
      path: 'dental',
      layoutTemplate: () => ({
        id: ohif.layout,
        props: {
          leftPanels: [ohif.thumbnailList],
          leftPanelResizable: true,
          rightPanels: [dental.measurements],
          rightPanelClosed: false,
          rightPanelResizable: true,
          viewports: [
            {
              namespace: cornerstone.viewport,
              displaySetsToDisplay: [ohif.sopClassHandler],
            },
            {
              namespace: dicomsr.viewport,
              displaySetsToDisplay: [dicomsr.sopClassHandler],
            },
          ],
        },
      }),
    },
  ],
  extensions: extensionDependencies,
  hangingProtocol: '@ohif/hpDental2x2',
  sopClassHandlers: [ohif.sopClassHandler, dicomsr.sopClassHandler],
};

/**
 * Apply app-config modesConfiguration patches (hide, isValidMode, etc.) via
 * immutability-helper — do not spread modeConfiguration onto the mode object.
 */
function modeFactory({ modeConfiguration }: { modeConfiguration?: Record<string, unknown> }) {
  if (modeConfiguration) {
    return update(modeInstance, modeConfiguration);
  }
  return modeInstance;
}

const mode = {
  id,
  modeFactory,
  extensionDependencies,
};

export default mode;
export { initToolGroups, toolbarButtons };
