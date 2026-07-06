import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Icons, useModal, useUserAuthentication } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { Toolbar } from '@ohif/extension-default';
import { preserveQueryParameters } from '@ohif/app';

import DentalHeader from './DentalHeader';
import DentalPatientStrip from '../../patients/components/DentalPatientStrip';
import { HeaderDivider } from '../../../shared';
import ThemeToggle from './ThemeToggle';
import ToothSelector from './ToothSelector';
import { useAuth } from '../../auth';
import { useToothSelector, useDentalTheme } from '../hooks/useToothSelector';

type PracticeHeaderProps = {
  appConfig: AppTypes.Config & { dentalPracticeName?: string };
};

function PracticeHeader({ appConfig }: PracticeHeaderProps) {
  const { servicesManager, commandsManager } = useSystem();
  const { customizationService } = servicesManager.services;
  const [{ user }] = useUserAuthentication();
  const { logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { show } = useModal();

  const { selectedTooth, toothSystem, onToothChange, onSystemChange } = useToothSelector();
  const { onThemeChange } = useDentalTheme();

  const practiceName = appConfig.dentalPracticeName ?? 'Dental Practice';

  const onClickReturnButton = () => {
    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);
    const searchQuery = new URLSearchParams();
    if (dataSourceIdx !== -1) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }
    preserveQueryParameters(searchQuery);
    navigate({ pathname: '/', search: decodeURIComponent(searchQuery.toString()) });
  };

  const AboutModal = customizationService.getCustomization('ohif.aboutModal');
  const AppearanceModal = customizationService.getCustomization('ohif.appearanceModal');
  const UserPreferencesModal = customizationService.getCustomization('ohif.userPreferencesModal');

  const menuOptions = [
    {
      title: AboutModal?.menuTitle ?? t('Header:About'),
      icon: 'info',
      onClick: () =>
        show({
          content: AboutModal,
          title: AboutModal?.title ?? t('AboutModal:About OHIF Viewer'),
          containerClassName: AboutModal?.containerClassName ?? 'max-w-md',
        }),
    },
    {
      title: UserPreferencesModal?.menuTitle ?? t('Header:Preferences'),
      icon: 'settings',
      onClick: () =>
        show({
          content: UserPreferencesModal,
          title: UserPreferencesModal?.title ?? t('UserPreferencesModal:User preferences'),
          containerClassName:
            UserPreferencesModal?.containerClassName ?? 'flex max-w-4xl p-6 flex-col',
        }),
    },
  ];

  if (AppearanceModal) {
    menuOptions.splice(1, 0, {
      title: AppearanceModal.menuTitle ?? t('Header:Appearance'),
      icon: 'ColorChange',
      onClick: () =>
        show({
          content: AppearanceModal,
          title: AppearanceModal.title ?? t('AppearanceModal:Appearance'),
          containerClassName: AppearanceModal.containerClassName ?? 'max-w-md',
        }),
    });
  }

  if (user) {
    menuOptions.push({
      title: 'Logout',
      icon: 'power-off',
      onClick: () => logout(),
    });
  }

  return (
    <DentalHeader
      menuOptions={menuOptions}
      practiceName={practiceName}
      isReturnEnabled={!!appConfig.showStudyList}
      onClickReturnButton={onClickReturnButton}
      practiceBar={
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden sm:gap-4 lg:gap-5">
          <DentalPatientStrip />
          <HeaderDivider />
          <ToothSelector
            selectedTooth={selectedTooth}
            toothSystem={toothSystem}
            onToothChange={onToothChange}
            onSystemChange={onSystemChange}
          />
        </div>
      }
      headerActions={<ThemeToggle onThemeChange={onThemeChange} />}
      UndoRedo={
        <>
          <div className="bg-border/60 mx-1 hidden h-7 w-px shrink-0 lg:block" aria-hidden />
          <div className="text-muted-foreground flex shrink-0 items-center">
            <Button
              variant="ghost"
              className="hover:bg-muted/60 hover:text-primary h-9 w-9"
              data-cy="undo-btn"
              onClick={() => commandsManager.run('undo')}
            >
              <Icons.Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-muted/60 hover:text-primary h-9 w-9"
              data-cy="redo-btn"
              onClick={() => commandsManager.run('redo')}
            >
              <Icons.Redo className="h-4 w-4" />
            </Button>
          </div>
        </>
      }
    >
      <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden px-2">
        <Toolbar buttonSection="primary" />
      </div>
    </DentalHeader>
  );
}

export default PracticeHeader;
