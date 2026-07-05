import { dentalMeasurementStore } from './services/dentalMeasurementStore';
import { DENTAL_MEASUREMENT_PRESETS } from './components/MeasurementsPalette';
import { loadViewerState, exportMeasurementsJson } from './services/dentalApiService';
import { applyDentalTheme } from './components/DentalThemeToggle';

let measurementSubscription: (() => void) | null = null;

function formatMeasurementValue(measurement: AppTypes.Measurement): { value: string; unit: string } {
  const displayText = measurement.displayText ?? measurement.label ?? '';
  const match = String(displayText).match(/([\d.]+)\s*(mm|°|deg)?/i);
  if (match) {
    return {
      value: match[1],
      unit: match[2]?.replace('deg', '°') ?? (measurement.toolName === 'Angle' ? '°' : 'mm'),
    };
  }
  return { value: displayText || '0', unit: measurement.toolName === 'Angle' ? '°' : 'mm' };
}

const getCommandsModule = ({ commandsManager, servicesManager }) => {
  const { measurementService } = servicesManager.services;

  const actions = {
    toggleMeasurementsPalette: ({ isOpen }) => {
      return { isOpen: !isOpen };
    },

    startDentalMeasurement: ({ presetId }) => {
      const preset = DENTAL_MEASUREMENT_PRESETS.find(p => p.id === presetId);
      if (!preset) {
        return;
      }
      dentalMeasurementStore.setPendingPreset(preset.label, preset.tool, preset.unit);
      commandsManager.runCommand('setToolActive', {
        toolName: preset.tool,
        toolGroupId: 'default',
      });
    },

    exportDentalMeasurementsJson: () => {
      const studyInstanceUid =
        new URLSearchParams(window.location.search).get('StudyInstanceUIDs')?.split(',')[0] ?? 'unknown';
      exportMeasurementsJson(studyInstanceUid, 'Bright Smile Dental');
    },

    loadDentalViewerState: async () => {
      const studyInstanceUid = new URLSearchParams(window.location.search).get('StudyInstanceUIDs')?.split(',')[0];
      if (!studyInstanceUid) {
        return;
      }
      try {
        const state = await loadViewerState(studyInstanceUid);
        if (state?.theme === 'clinical' || state?.theme === 'standard') {
          applyDentalTheme(state.theme);
        }
      } catch (err) {
        console.warn('Could not load dental viewer state', err);
      }
    },
  };

  const definitions = {
    toggleMeasurementsPalette: {
      commandFn: actions.toggleMeasurementsPalette,
    },
    startDentalMeasurement: {
      commandFn: actions.startDentalMeasurement,
    },
    exportDentalMeasurementsJson: {
      commandFn: actions.exportDentalMeasurementsJson,
    },
    loadDentalViewerState: {
      commandFn: actions.loadDentalViewerState,
    },
  };

  return { actions, definitions, defaultContext: 'DEFAULT' };
};

export function initDentalMeasurementTracking(servicesManager) {
  const { measurementService } = servicesManager.services;

  if (measurementSubscription) {
    measurementSubscription();
    measurementSubscription = null;
  }

  const handleAdded = ({ measurement }) => {
    if (!measurement?.uid) {
      return;
    }
    const preset = dentalMeasurementStore.consumePendingPreset();
    const label = preset?.label ?? measurement.label ?? 'Measurement';
    if (preset?.label) {
      measurementService.update(measurement.uid, { ...measurement, label: preset.label });
    }
    const { value, unit } = formatMeasurementValue(measurement);
    const existing = dentalMeasurementStore.getMeasurements().find(m => m.uid === measurement.uid);
    if (existing) {
      return;
    }
    dentalMeasurementStore.addMeasurement({
      uid: measurement.uid,
      label,
      value,
      unit: preset?.unit ?? unit,
      tool: preset?.tool ?? measurement.toolName ?? 'Unknown',
      capturedAt: new Date().toISOString(),
      coordinates: measurement.points,
    });
  };

  const events = [
    measurementService.EVENTS.MEASUREMENT_ADDED,
    measurementService.EVENTS.RAW_MEASUREMENT_ADDED,
  ];

  const unsubs = events.map(evt => measurementService.subscribe(evt, handleAdded).unsubscribe);
  measurementSubscription = () => unsubs.forEach(u => u());
}

export default getCommandsModule;
