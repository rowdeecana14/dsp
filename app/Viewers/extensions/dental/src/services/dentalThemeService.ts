/**
 * Dental Theme Service
 * Manages dental theme application and customization
 */

import dentalThemeData from '../constants/dentalTheme';

export class DentalThemeService {
  private isEnabled: boolean = false;

  constructor(private customizationService?: any) {}

  enableDentalTheme() {
    if (this.customizationService) {
      this.customizationService.setCustomizations(dentalThemeData);
      this.isEnabled = true;
      localStorage.setItem('dentalThemeEnabled', 'true');
    }
  }

  disableDentalTheme() {
    if (this.customizationService) {
      // Reset to default theme
      this.customizationService.setCustomizations({
        'theme.colors': { $set: {} }, // Reset to default
      });
      this.isEnabled = false;
      localStorage.setItem('dentalThemeEnabled', 'false');
    }
  }

  toggleDentalTheme() {
    if (this.isEnabled) {
      this.disableDentalTheme();
    } else {
      this.enableDentalTheme();
    }
  }

  isDentalThemeEnabled(): boolean {
    return this.isEnabled;
  }

  getThemeColor(colorName: string): string {
    const colors = dentalThemeData['theme.colors'].$set;
    return colors[colorName] || '#000000';
  }

  restoreSavedPreference() {
    const saved = localStorage.getItem('dentalThemeEnabled');
    if (saved === 'true') {
      this.enableDentalTheme();
    } else if (saved === 'false') {
      this.disableDentalTheme();
    }
  }
}

export default DentalThemeService;
