import { useCallback } from 'react';
import { useSystem } from '@ohif/core';
import {
  handleDentalMeasurementAction,
  activateDentalMeasurementTool,
} from '../services/dentalMeasurementActions';

/** Measurement row actions (jump, rename, delete) for list components. */
export function useMeasurementActions(items: Record<string, unknown>[]) {
  const { commandsManager, servicesManager } = useSystem();

  const runAction = useCallback(
    (command: string, uid: string) => {
      void handleDentalMeasurementAction(
        commandsManager,
        servicesManager,
        command,
        uid,
        items
      );
    },
    [commandsManager, servicesManager, items]
  );

  const activateTool = useCallback(
    (toolName: string) => {
      activateDentalMeasurementTool(commandsManager, servicesManager, toolName);
    },
    [commandsManager, servicesManager]
  );

  return { runAction, activateTool };
}
