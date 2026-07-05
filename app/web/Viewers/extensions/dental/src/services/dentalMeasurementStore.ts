export interface DentalMeasurement {
  uid: string;
  label: string;
  value: string;
  unit: string;
  tool: string;
  capturedAt: string;
  coordinates?: Record<string, unknown>;
}

type Listener = () => void;

let measurements: DentalMeasurement[] = [];
let pendingLabel: string | null = null;
let pendingTool: string | null = null;
let pendingUnit: string | null = null;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => fn());
}

export const dentalMeasurementStore = {
  getMeasurements: () => [...measurements],

  setMeasurements: (items: DentalMeasurement[]) => {
    measurements = [...items];
    notify();
  },

  addMeasurement: (item: DentalMeasurement) => {
    measurements = [...measurements, item];
    notify();
  },

  removeMeasurement: (uid: string) => {
    measurements = measurements.filter(m => m.uid !== uid);
    notify();
  },

  setPendingPreset: (label: string, tool: string, unit: string) => {
    pendingLabel = label;
    pendingTool = tool;
    pendingUnit = unit;
  },

  consumePendingPreset: () => {
    const preset = pendingLabel
      ? { label: pendingLabel, tool: pendingTool ?? '', unit: pendingUnit ?? '' }
      : null;
    pendingLabel = null;
    pendingTool = null;
    pendingUnit = null;
    return preset;
  },

  getPendingPreset: () =>
    pendingLabel ? { label: pendingLabel, tool: pendingTool ?? '', unit: pendingUnit ?? '' } : null,

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
