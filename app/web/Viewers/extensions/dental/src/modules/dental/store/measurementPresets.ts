export interface DentalMeasurementPreset {
  id: string;
  label: string;
  toolName: string;
  unit: string;
}

export const DENTAL_MEASUREMENT_PRESETS: DentalMeasurementPreset[] = [
  { id: 'pa-length', label: 'PA length', toolName: 'Length', unit: 'mm' },
  { id: 'canal-angle', label: 'Canal angle', toolName: 'Angle', unit: '°' },
  { id: 'crown-width', label: 'Crown width', toolName: 'Bidirectional', unit: 'mm' },
  { id: 'root-length', label: 'Root length', toolName: 'Length', unit: 'mm' },
];
