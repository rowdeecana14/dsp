import { useDentalBrandingStore, DENTAL_LOGO_ASSET_PATH } from '../../modules/dental/store/dentalBranding.store';

export const DENTAL_LOGO_PATH = DENTAL_LOGO_ASSET_PATH;

export type DentalBrandingConfig = AppTypes.Config & {
  dentalPracticeName?: string;
  dentalPracticeLogo?: string;
};

export function resolveDentalLogoPath(config?: DentalBrandingConfig | null): string {
  return config?.dentalPracticeLogo ?? DENTAL_LOGO_PATH;
}

export function resolveDentalLogoUrl(config?: DentalBrandingConfig | null): string {
  const logoPath = resolveDentalLogoPath(config);
  const publicUrl =
    typeof window !== 'undefined' && window.PUBLIC_URL ? window.PUBLIC_URL : '/';
  const base = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
  return `${base}${logoPath.replace(/^\//, '')}`;
}

export function getDentalPracticeName(config?: DentalBrandingConfig | null): string {
  if (config?.dentalPracticeName) {
    return config.dentalPracticeName;
  }

  if (typeof window !== 'undefined') {
    const windowConfig = (window.config as DentalBrandingConfig | undefined)?.dentalPracticeName;
    if (windowConfig) {
      return windowConfig;
    }
  }

  return 'Dental Practice';
}

export function initializeDentalBranding(config?: DentalBrandingConfig | null): void {
  useDentalBrandingStore.getState().setBranding({
    practiceName: getDentalPracticeName(config),
    logoUrl: resolveDentalLogoUrl(config),
  });
  applyDentalSiteBranding();
  ensureBrandingSubscription();
}

let brandingSubscribed = false;

function ensureBrandingSubscription(): void {
  if (brandingSubscribed || typeof document === 'undefined') {
    return;
  }

  brandingSubscribed = true;
  useDentalBrandingStore.subscribe(() => {
    applyDentalSiteBranding();
  });
}

export function applyDentalSiteBranding(): void {
  applyDentalDocumentTitle();
  applyDentalFavicon();
}

export function applyDentalDocumentTitle(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const { practiceName } = useDentalBrandingStore.getState();
  document.title = practiceName;

  const applicationName = document.querySelector<HTMLMetaElement>(
    'meta[name="application-name"]'
  );
  if (applicationName) {
    applicationName.content = practiceName;
  }

  const appleTitle = document.querySelector<HTMLMetaElement>(
    'meta[name="apple-mobile-web-app-title"]'
  );
  if (appleTitle) {
    appleTitle.content = practiceName;
  }
}

export function applyDentalFavicon(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const { logoUrl } = useDentalBrandingStore.getState();
  if (!logoUrl) {
    return;
  }

  const iconType = logoUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png';

  document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']").forEach(link => {
    link.href = logoUrl;
    link.type = iconType;
  });

  document.querySelectorAll<HTMLLinkElement>("link[rel='apple-touch-icon']").forEach(link => {
    link.href = logoUrl;
  });
}

/** Update branding at runtime (e.g. future API / tenant settings). */
export function updateDentalBranding(
  patch: Partial<{ practiceName: string; logoUrl: string }>
): void {
  useDentalBrandingStore.getState().setBranding(patch);
  applyDentalSiteBranding();
}
