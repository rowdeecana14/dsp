import { create } from 'zustand';
import type { ToothSystem } from '../../../shared/utils/toothNumbering';
import {
  DENTAL_MEASUREMENT_PRESETS,
  type DentalMeasurementPreset,
} from '../store/measurementPresets';

interface DentalState {
  selectedTooth: string;
  toothSystem: ToothSystem;
  activePreset: DentalMeasurementPreset | null;
  presetByUid: Record<string, string>;
  labelByUid: Record<string, string>;
  setSelectedTooth: (tooth: string) => void;
  setToothSystem: (system: ToothSystem) => void;
  setActivePreset: (preset: DentalMeasurementPreset | null) => void;
  clearActivePreset: () => void;
  rememberPresetForMeasurement: (uid: string, presetId: string | undefined) => void;
  rememberMeasurementLabel: (uid: string, label: string | undefined) => void;
  getMeasurementLabel: (uid: string | undefined) => string | undefined;
  getPresetForMeasurement: (uid: string | undefined) => string | undefined;
  forgetPresetForMeasurement: (uid: string | undefined) => void;
  clearMeasurementMemory: () => void;
  reset: () => void;
}

const initialState = {
  selectedTooth: '11',
  toothSystem: 'FDI' as ToothSystem,
  activePreset: null,
  presetByUid: {} as Record<string, string>,
  labelByUid: {} as Record<string, string>,
};

export const useDentalStore = create<DentalState>((set, get) => ({
  ...initialState,

  setSelectedTooth: selectedTooth => set({ selectedTooth }),
  setToothSystem: toothSystem => set({ toothSystem }),
  setActivePreset: activePreset => set({ activePreset }),
  clearActivePreset: () => set({ activePreset: null }),

  rememberPresetForMeasurement: (uid, presetId) => {
    if (!uid || !presetId) {
      return;
    }
    set(state => ({
      presetByUid: { ...state.presetByUid, [uid]: presetId },
    }));
  },

  rememberMeasurementLabel: (uid, label) => {
    const trimmed = String(label ?? '').trim();
    if (!uid || !trimmed) {
      return;
    }
    set(state => ({
      labelByUid: { ...state.labelByUid, [uid]: trimmed },
    }));
  },

  getMeasurementLabel: uid => {
    if (!uid) {
      return undefined;
    }
    return get().labelByUid[uid];
  },

  getPresetForMeasurement: uid => {
    if (!uid) {
      return undefined;
    }
    return get().presetByUid[uid];
  },

  forgetPresetForMeasurement: uid => {
    if (!uid) {
      return;
    }
    set(state => {
      const presetByUid = { ...state.presetByUid };
      const labelByUid = { ...state.labelByUid };
      delete presetByUid[uid];
      delete labelByUid[uid];
      return { presetByUid, labelByUid };
    });
  },

  clearMeasurementMemory: () =>
    set({
      activePreset: null,
      presetByUid: {},
      labelByUid: {},
    }),

  reset: () => set({ ...initialState, presetByUid: {}, labelByUid: {} }),
}));

/** Ensures API/UI always receive a non-empty measurement label. */
export function resolveDentalMeasurementLabel(measurement: {
  uid?: unknown;
  label?: unknown;
  toolName?: unknown;
  type?: unknown;
  dentalPresetId?: string;
  dental_preset_id?: string;
}): string {
  const raw = String(measurement.label ?? '').trim();
  if (raw) {
    return raw;
  }

  const uid = String(measurement.uid ?? '');
  const remembered = useDentalStore.getState().getMeasurementLabel(uid);
  if (remembered) {
    return remembered;
  }

  if (measurement.dentalPresetId) {
    const preset = DENTAL_MEASUREMENT_PRESETS.find(p => p.id === measurement.dentalPresetId);
    if (preset) {
      return preset.label;
    }
  }

  const presetId = measurement.dental_preset_id;
  if (presetId) {
    const preset = DENTAL_MEASUREMENT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      return preset.label;
    }
  }

  const tool = String(measurement.toolName ?? measurement.type ?? '').trim();
  return tool || 'Measurement';
}

/** Resolve preset id from explicit field or infer from label/tool. */
export function resolveDentalPresetId(measurement: {
  dentalPresetId?: string;
  dental_preset_id?: string;
  label?: unknown;
  toolName?: unknown;
  type?: unknown;
  unit?: unknown;
}): string | undefined {
  const explicit = measurement.dentalPresetId ?? measurement.dental_preset_id;
  if (explicit) {
    return String(explicit);
  }

  const label = String(measurement.label ?? '').trim();
  const byLabel = DENTAL_MEASUREMENT_PRESETS.find(preset => preset.label === label);
  if (byLabel) {
    return byLabel.id;
  }

  const tool = String(measurement.toolName ?? measurement.type ?? '').trim();
  const unit = String(measurement.unit ?? '').trim();
  const byTool = DENTAL_MEASUREMENT_PRESETS.find(
    preset =>
      preset.toolName === tool &&
      (!unit || preset.unit === unit || (preset.unit === '°' && unit === 'deg'))
  );

  return byTool?.id;
}

// Backward-compatible helpers for services that used module-level functions
export function setActiveDentalPreset(preset: DentalMeasurementPreset | null): void {
  useDentalStore.getState().setActivePreset(preset);
}

export function getActiveDentalPreset(): DentalMeasurementPreset | null {
  return useDentalStore.getState().activePreset;
}

export function clearActiveDentalPreset(): void {
  useDentalStore.getState().clearActivePreset();
}

export function rememberDentalPresetForMeasurement(uid: string, presetId: string | undefined): void {
  useDentalStore.getState().rememberPresetForMeasurement(uid, presetId);
}

export function rememberDentalMeasurementLabel(uid: string, label: string | undefined): void {
  useDentalStore.getState().rememberMeasurementLabel(uid, label);
}

export function getDentalMeasurementLabel(uid: string | undefined): string | undefined {
  return useDentalStore.getState().getMeasurementLabel(uid);
}

export function getDentalPresetForMeasurement(uid: string | undefined): string | undefined {
  return useDentalStore.getState().getPresetForMeasurement(uid);
}

export function forgetDentalPresetForMeasurement(uid: string | undefined): void {
  useDentalStore.getState().forgetPresetForMeasurement(uid);
}

export function clearDentalMeasurementMemory(): void {
  useDentalStore.getState().clearMeasurementMemory();
}

export { DENTAL_MEASUREMENT_PRESETS };
export type { DentalMeasurementPreset };
