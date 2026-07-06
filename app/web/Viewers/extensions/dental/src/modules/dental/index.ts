/** Public API for the dental module. */
export { default as PracticeHeader } from './components/PracticeHeader';
export { default as DentalHeader } from './components/DentalHeader';
export { default as ToothSelector } from './components/ToothSelector';
export { default as ThemeToggle } from './components/ThemeToggle';
export { default as MeasurementsPalette } from './components/MeasurementsPalette';
export { default as DentalMeasurementsToolbarButton } from './components/DentalMeasurementsToolbarButton';
export { useToothSelector, useDentalTheme } from './hooks/useToothSelector';
export {
  useDentalStore,
  DENTAL_MEASUREMENT_PRESETS,
  resolveDentalMeasurementLabel,
  resolveDentalPresetId,
  setActiveDentalPreset,
  getActiveDentalPreset,
  clearActiveDentalPreset,
  rememberDentalPresetForMeasurement,
  rememberDentalMeasurementLabel,
  getDentalMeasurementLabel,
  getDentalPresetForMeasurement,
  forgetDentalPresetForMeasurement,
  clearDentalMeasurementMemory,
} from './store/dental.store';
export type { DentalMeasurementPreset } from './store/measurementPresets';
export { toothSelectionSchema, presetIdSchema } from './schemas/dental.schema';
