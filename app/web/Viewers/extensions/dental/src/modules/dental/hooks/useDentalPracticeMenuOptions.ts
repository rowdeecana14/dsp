import { useTranslation } from 'react-i18next';
import { useModal, useUserAuthentication } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { useAuth } from '../../auth';

export type DentalHeaderMenuOption = {
  title: string;
  icon?: string;
  onClick: () => void;
};

export function useDentalPracticeMenuOptions(): DentalHeaderMenuOption[] {
  const { servicesManager } = useSystem();
  const { customizationService } = servicesManager.services;
  const [{ user }] = useUserAuthentication();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const { show } = useModal();

  const AboutModal = customizationService.getCustomization('ohif.aboutModal');
  const AppearanceModal = customizationService.getCustomization('ohif.appearanceModal');
  const UserPreferencesModal = customizationService.getCustomization('ohif.userPreferencesModal');

  const menuOptions: DentalHeaderMenuOption[] = [
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

  return menuOptions;
}
