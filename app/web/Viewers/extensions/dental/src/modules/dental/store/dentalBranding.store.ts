import { create } from 'zustand';

export const DENTAL_LOGO_ASSET_PATH = 'assets/dental-logo.png';

export type DentalBrandingState = {
  practiceName: string;
  logoUrl: string;
  initialized: boolean;
  setBranding: (patch: Partial<Pick<DentalBrandingState, 'practiceName' | 'logoUrl'>>) => void;
  reset: () => void;
};

const DEFAULT_PRACTICE_NAME = 'Dental Practice';

function buildDefaultLogoUrl(): string {
  const publicUrl =
    typeof window !== 'undefined' && window.PUBLIC_URL ? window.PUBLIC_URL : '/';
  const base = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
  return `${base}${DENTAL_LOGO_ASSET_PATH}`;
}

const initialState = {
  practiceName: DEFAULT_PRACTICE_NAME,
  logoUrl: buildDefaultLogoUrl(),
  initialized: false,
};

export const useDentalBrandingStore = create<DentalBrandingState>(set => ({
  ...initialState,

  setBranding: patch =>
    set(state => {
      const practiceName = patch.practiceName ?? state.practiceName;
      const logoUrl = patch.logoUrl ?? state.logoUrl;

      if (
        state.initialized &&
        practiceName === state.practiceName &&
        logoUrl === state.logoUrl
      ) {
        return state;
      }

      return {
        ...state,
        practiceName,
        logoUrl,
        initialized: true,
      };
    }),

  reset: () => set({ ...initialState, logoUrl: buildDefaultLogoUrl() }),
}));

export type DentalBrandingSnapshot = {
  practiceName: string;
  logoUrl: string;
};

let cachedBrandingSnapshot: DentalBrandingSnapshot | null = null;
let cachedBrandingKey = '';

function getStableBrandingSnapshot(): DentalBrandingSnapshot {
  const { practiceName, logoUrl } = useDentalBrandingStore.getState();
  const key = `${practiceName}\0${logoUrl}`;

  if (cachedBrandingKey === key && cachedBrandingSnapshot) {
    return cachedBrandingSnapshot;
  }

  cachedBrandingKey = key;
  cachedBrandingSnapshot = { practiceName, logoUrl };
  return cachedBrandingSnapshot;
}

/** For platform WorkList via customization — reactive without importing dental into platform. */
export const dentalBrandingApi = {
  subscribe(listener: () => void): () => void {
    return useDentalBrandingStore.subscribe(listener);
  },
  getSnapshot(): DentalBrandingSnapshot {
    return getStableBrandingSnapshot();
  },
};
