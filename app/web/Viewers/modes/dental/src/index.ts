import i18n from 'i18next';
import { ToolbarService } from '@ohif/core';
import { id } from './id';
import initToolGroups from './initToolGroups';
import toolbarButtons from './toolbarButtons';
import { applyDentalTheme } from '@ohif/extension-dental/src/components/DentalThemeToggle';

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

function modeFactory({ modeConfiguration }) {
  let _activatePanelTriggersSubscriptions = [];

  return {
    id,
    routeName: 'dental',
    displayName: i18n.t('Dental Mode'),
    onModeEnter: ({
      servicesManager,
      extensionManager,
      commandsManager,
      customizationService,
    }: withAppTypes) => {
      const { measurementService, toolbarService, toolGroupService } = servicesManager.services;

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

      applyDentalTheme('clinical');
      commandsManager.runCommand('loadDentalViewerState');
    },
    onModeExit: ({ servicesManager }: withAppTypes) => {
      const {
        toolGroupService,
        syncGroupService,
        segmentationService,
        cornerstoneViewportService,
        uiDialogService,
        uiModalService,
      } = servicesManager.services;

      _activatePanelTriggersSubscriptions.forEach(sub => sub.unsubscribe());
      _activatePanelTriggersSubscriptions = [];

      uiDialogService.hideAll();
      uiModalService.hide();
      toolGroupService.destroy();
      syncGroupService.destroy();
      segmentationService.destroy();
      cornerstoneViewportService.destroy();
      applyDentalTheme('standard');
    },
    validationTags: { study: [], series: [] },
    isValidMode: ({ modalities }) => {
      const list = modalities.split('\\');
      const dentalModalities = ['DX', 'CR', 'IO', 'PX', 'CT'];
      const valid = list.some(m => dentalModalities.includes(m));
      return {
        valid,
        description: valid
          ? 'Dental imaging modalities detected'
          : 'Dental mode supports DX, CR, IO, PX, CT modalities',
      };
    },
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
    ...modeConfiguration,
  };
}

const mode = {
  id,
  modeFactory,
  extensionDependencies,
};

export default mode;
export { initToolGroups, toolbarButtons };
