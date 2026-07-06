export const DENTAL_VIEWPORT_IDS = {
  current: 'dental-current',
  prior: 'dental-prior',
  bwLeft: 'dental-bw-left',
  bwRight: 'dental-bw-right',
} as const;

export type DentalViewportId = (typeof DENTAL_VIEWPORT_IDS)[keyof typeof DENTAL_VIEWPORT_IDS];

export const VIEWPORT_SLOT_MAP: Record<string, 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right'> = {
  [DENTAL_VIEWPORT_IDS.current]: 'top_left',
  [DENTAL_VIEWPORT_IDS.prior]: 'top_right',
  [DENTAL_VIEWPORT_IDS.bwLeft]: 'bottom_left',
  [DENTAL_VIEWPORT_IDS.bwRight]: 'bottom_right',
};
