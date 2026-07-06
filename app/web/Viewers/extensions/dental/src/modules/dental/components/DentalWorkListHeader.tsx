import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@state';
import DentalHeader from './DentalHeader';
import ThemeToggle from './ThemeToggle';
import { useDentalBranding } from '../hooks/useDentalBranding';
import { useDentalPracticeMenuOptions } from '../hooks/useDentalPracticeMenuOptions';
import { useDentalTheme } from '../hooks/useToothSelector';
import { initializeDentalBranding } from '../../../shared/utils/dentalBranding';

/** Study list header — same chrome as the dental viewer, with a Study List page title. */
function DentalWorkListHeader() {
  const [appConfig] = useAppConfig();
  const { t } = useTranslation('StudyList');
  const { practiceName, logoUrl } = useDentalBranding();
  const menuOptions = useDentalPracticeMenuOptions();
  const { onThemeChange } = useDentalTheme();

  const practiceNameFromConfig = (appConfig as { dentalPracticeName?: string })?.dentalPracticeName;
  const logoPathFromConfig = (appConfig as { dentalPracticeLogo?: string })?.dentalPracticeLogo;

  useEffect(() => {
    initializeDentalBranding({
      dentalPracticeName: practiceNameFromConfig,
      dentalPracticeLogo: logoPathFromConfig,
    });
  }, [practiceNameFromConfig, logoPathFromConfig]);

  return (
    <DentalHeader
      practiceName={practiceName}
      logoUrl={logoUrl}
      menuOptions={menuOptions}
      isReturnEnabled={false}
      headerActions={<ThemeToggle onThemeChange={onThemeChange} />}
      headerCenter={
        <h1
          className="text-foreground text-lg font-semibold tracking-tight sm:text-xl"
          data-cy="worklist-page-title"
        >
          {t('StudyList')}
        </h1>
      }
      practiceBar={null}
      data-cy="worklist-practice-header"
    />
  );
}

export default DentalWorkListHeader;
