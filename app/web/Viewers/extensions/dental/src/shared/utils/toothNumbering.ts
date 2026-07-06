/** FDI (ISO) tooth numbers for adult dentition */
export const FDI_TEETH = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '38', '37', '36', '35', '34', '33', '32', '31',
  '41', '42', '43', '44', '45', '46', '47', '48',
];

/** Universal (ADA) tooth numbers 1–32 */
export const UNIVERSAL_TEETH = Array.from({ length: 32 }, (_, i) => String(i + 1));

/** FDI → Universal mapping (adult) */
const FDI_TO_UNIVERSAL: Record<string, string> = {
  '18': '1', '17': '2', '16': '3', '15': '4', '14': '5', '13': '6', '12': '7', '11': '8',
  '21': '9', '22': '10', '23': '11', '24': '12', '25': '13', '26': '14', '27': '15', '28': '16',
  '38': '17', '37': '18', '36': '19', '35': '20', '34': '21', '33': '22', '32': '23', '31': '24',
  '41': '25', '42': '26', '43': '27', '44': '28', '45': '29', '46': '30', '47': '31', '48': '32',
};

const UNIVERSAL_TO_FDI: Record<string, string> = Object.fromEntries(
  Object.entries(FDI_TO_UNIVERSAL).map(([fdi, uni]) => [uni, fdi])
);

const FDI_QUADRANT_LABELS: Record<string, string> = {
  '1': 'UR',
  '2': 'UL',
  '3': 'LL',
  '4': 'LR',
};

const UNIVERSAL_QUADRANT_LABELS: Record<string, string> = {
  '1': 'UR', '2': 'UR', '3': 'UR', '4': 'UR', '5': 'UR', '6': 'UR', '7': 'UR', '8': 'UR',
  '9': 'UL', '10': 'UL', '11': 'UL', '12': 'UL', '13': 'UL', '14': 'UL', '15': 'UL', '16': 'UL',
  '17': 'LL', '18': 'LL', '19': 'LL', '20': 'LL', '21': 'LL', '22': 'LL', '23': 'LL', '24': 'LL',
  '25': 'LR', '26': 'LR', '27': 'LR', '28': 'LR', '29': 'LR', '30': 'LR', '31': 'LR', '32': 'LR',
};

export type ToothSystem = 'FDI' | 'Universal';

export function getTeethForSystem(system: ToothSystem): string[] {
  return system === 'FDI' ? FDI_TEETH : UNIVERSAL_TEETH;
}

export function getToothQuadrant(tooth: string, system: ToothSystem): string {
  if (system === 'FDI') {
    return FDI_QUADRANT_LABELS[tooth.charAt(0)] ?? '';
  }
  return UNIVERSAL_QUADRANT_LABELS[tooth] ?? '';
}

export function formatToothLabel(tooth: string, system: ToothSystem): string {
  const quadrant = getToothQuadrant(tooth, system);
  return quadrant ? `${tooth} (${quadrant})` : tooth;
}

export function convertTooth(tooth: string, from: ToothSystem, to: ToothSystem): string {
  if (from === to) {
    return tooth;
  }
  if (from === 'FDI' && to === 'Universal') {
    return FDI_TO_UNIVERSAL[tooth] ?? tooth;
  }
  if (from === 'Universal' && to === 'FDI') {
    return UNIVERSAL_TO_FDI[tooth] ?? tooth;
  }
  return tooth;
}
