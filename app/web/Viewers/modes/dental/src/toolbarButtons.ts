import type { Button } from '@ohif/core/types';
import { EVENTS } from '@cornerstonejs/core';
import { ViewportGridService } from '@ohif/core';
import i18n from 'i18next';

const callbacks = (toolName: string) => [
  {
    commandName: 'setViewportForToolConfiguration',
    commandOptions: { toolName },
  },
];

export const setToolActiveToolbar = {
  commandName: 'setToolActiveToolbar',
  commandOptions: { toolGroupIds: ['default', 'mpr', 'SRToolGroup', 'volume3d'] },
};

const toolbarButtons: Button[] = [
  {
    id: 'DentalMeasurementsPalette',
    uiType: 'dental.measurementsPalette',
    props: {
      icon: 'tool-length',
      label: 'Measurements',
      tooltip: 'Open dental measurement presets',
    },
  },
  {
    id: 'MeasurementTools',
    uiType: 'ohif.toolButtonList',
    props: { buttonSection: true },
  },
  {
    id: 'Zoom',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-zoom',
      label: i18n.t('Buttons:Zoom'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
      listeners: {
        [EVENTS.VIEWPORT_NEW_IMAGE_SET]: {
          commandName: 'setViewportForToolConfiguration',
          commandOptions: { toolName: 'Zoom' },
        },
        [ViewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED]: callbacks('Zoom'),
      },
    },
  },
  {
    id: 'Pan',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-move',
      label: i18n.t('Buttons:Pan'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'WindowLevel',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-window-level',
      label: i18n.t('Buttons:Window Level'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'Length',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-length',
      label: i18n.t('Buttons:Length'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
      options: 'length',
    },
  },
  {
    id: 'Angle',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-angle',
      label: i18n.t('Buttons:Angle'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'Layout',
    uiType: 'ohif.layoutSelector',
    props: {
      icon: 'tool-layout',
      label: i18n.t('Buttons:Layout'),
    },
  },
  {
    id: 'MoreTools',
    uiType: 'ohif.toolButtonList',
    props: { buttonSection: true },
  },
  {
    id: 'Reset',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-reset',
      label: i18n.t('Buttons:Reset'),
      commands: 'resetViewport',
    },
  },
  {
    id: 'StackScroll',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-stack-scroll',
      label: i18n.t('Buttons:Stack Scroll'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
];

export default toolbarButtons;
