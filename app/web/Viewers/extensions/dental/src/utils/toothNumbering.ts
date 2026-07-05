export type ToothSystem = 'FDI' | 'Universal';

export const UNIVERSAL_TEETH = [
  '1', '2', '3', '4', '5', '6', '7', '8',
  '9', '10', '11', '12', '13', '14', '15', '16',
  '17', '18', '19', '20', '21', '22', '23', '24',
  '25', '26', '27', '28', '29', '30', '31', '32',
];

export const FDI_TEETH = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '38', '37', '36', '35', '34', '33', '32', '31',
  '41', '42', '43', '44', '45', '46', '47', '48',
];

const FDI_TO_UNIVERSAL: Record<string, string> = {
  '11': '8', '12': '7', '13': '6', '14': '5', '15': '4', '16': '3', '17': '2', '18': '1',
  '21': '9', '22': '10', '23': '11', '24': '12', '25': '13', '26': '14', '27': '15', '28': '16',
  '31': '24', '32': '23', '33': '22', '34': '21', '35': '20', '36': '19', '37': '18', '38': '17',
  '41': '25', '42': '26', '43': '27', '44': '28', '45': '29', '46': '30', '47': '31', '48': '32',
};

const UNIVERSAL_TO_FDI: Record<string, string> = Object.fromEntries(
  Object.entries(FDI_TO_UNIVERSAL).map(([fdi, uni]) => [uni, fdi])
);

export function getTeethForSystem(system: ToothSystem): string[] {
  return system === 'FDI' ? FDI_TEETH : UNIVERSAL_TEETH;
}

export function convertTooth(tooth: string, from: ToothSystem, to: ToothSystem): string {
  if (from === to) {
    return tooth;
  }
  if (from === 'FDI' && to === 'Universal') {
    return FDI_TO_UNIVERSAL[tooth] ?? tooth;
  }
  return UNIVERSAL_TO_FDI[tooth] ?? tooth;
}
