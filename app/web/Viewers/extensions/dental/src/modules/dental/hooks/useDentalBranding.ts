import { useDentalBrandingStore } from '../store/dentalBranding.store';

export function useDentalBranding() {
  const practiceName = useDentalBrandingStore(state => state.practiceName);
  const logoUrl = useDentalBrandingStore(state => state.logoUrl);
  const initialized = useDentalBrandingStore(state => state.initialized);
  const setBranding = useDentalBrandingStore(state => state.setBranding);

  return {
    practiceName,
    logoUrl,
    initialized,
    setBranding,
  };
}
