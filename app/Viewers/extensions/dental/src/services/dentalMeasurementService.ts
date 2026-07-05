/**
 * Dental Measurement Service
 * Handles measurement tool activation, capture, and labeling
 */

import { DENTAL_MEASUREMENTS, MEASUREMENT_TOOLS } from '../constants/measurements';
import type { DentalMeasurement } from '../constants/measurements';

export interface CapturedMeasurement {
  id: string;
  label: string;
  value: string;
  unit: string;
  tool: string;
  capturedAt: string;
  coordinates?: any;
}

export class DentalMeasurementService {
  private cornerstoneViewportService?: any;
  private measurementService?: any;
  private currentPreset: DentalMeasurement | null = null;

  constructor(servicesManager?: any) {
    if (servicesManager?.services) {
      this.cornerstoneViewportService = servicesManager.services.cornerstoneViewportService;
      this.measurementService = servicesManager.services.measurementService;
    }
  }

  /**
   * Activate a measurement tool for a specific preset
   */
  activateMeasurementTool(presetId: string) {
    const preset = DENTAL_MEASUREMENTS.find((m) => m.id === presetId);
    if (!preset) {
      console.error(`Preset not found: ${presetId}`);
      return;
    }

    this.currentPreset = preset;

    // Get the tool name
    const toolName = MEASUREMENT_TOOLS[preset.tool];

    // TODO: Activate tool through toolGroupService
    console.log(`Activating tool: ${toolName} for preset: ${preset.name}`);
  }

  /**
   * Capture a completed measurement and auto-label it
   */
  captureMeasurement(measurementData: any): CapturedMeasurement | null {
    if (!this.currentPreset) {
      console.error('No preset selected');
      return null;
    }

    const captured: CapturedMeasurement = {
      id: `m-${Date.now()}`,
      label: this.currentPreset.label,
      value: this.formatValue(measurementData.value),
      unit: this.currentPreset.unit,
      tool: this.currentPreset.tool,
      capturedAt: new Date().toISOString(),
      coordinates: measurementData.coordinates,
    };

    // TODO: Store in measurement list
    return captured;
  }

  /**
   * Format measurement value to appropriate precision
   */
  private formatValue(value: number): string {
    if (typeof value !== 'number') return String(value);

    // For angles, use integer
    if (this.currentPreset?.unit === '°') {
      return Math.round(value).toString();
    }

    // For distances, use 1 decimal place
    return value.toFixed(1);
  }

  /**
   * Get all available measurement presets
   */
  getAvailablePresets(): DentalMeasurement[] {
    return DENTAL_MEASUREMENTS;
  }

  /**
   * Get the currently active preset
   */
  getCurrentPreset(): DentalMeasurement | null {
    return this.currentPreset;
  }
}

export default DentalMeasurementService;
