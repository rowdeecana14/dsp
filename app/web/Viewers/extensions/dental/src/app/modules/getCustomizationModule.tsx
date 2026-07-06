import type { ReactNode } from 'react';
import { DentalLoginPage, authService } from '../../modules/auth';

type SettingsMenuItem = {
  id: string;
  label: ReactNode;
  onClick: () => void;
};

function isDentalAuthEnabled(): boolean {
  return Boolean(
    typeof window !== 'undefined' &&
      (window.config as { dentalApiUrl?: string } | undefined)?.dentalApiUrl
  );
}

function appendDentalLogout(defaults: SettingsMenuItem[]): SettingsMenuItem[] {
  if (!isDentalAuthEnabled() || defaults.some(item => item.id === 'dental-logout')) {
    return defaults;
  }

  return [
    ...defaults,
    {
      id: 'dental-logout',
      label: 'Logout',
      onClick: () => authService.signOutAndRedirect(),
    },
  ];
}

export default function getCustomizationModule() {
  return [
    {
      name: 'dental',
      value: {
        'ohif.hotkeyBindings': {
          $push: [
            {
              commandName: 'exportDentalMeasurements',
              label: 'Export dental measurements JSON',
              keys: ['Ctrl', 'Shift', 'E'],
            },
          ],
        },
      },
    },
    {
      name: 'dentalAuth',
      value: {
        'routes.customRoutes': {
          routes: {
            $push: [
              {
                path: '/login',
                private: false,
                children: DentalLoginPage,
              },
            ],
          },
        },
        'workList.settingsMenuItems': (defaults: SettingsMenuItem[]) =>
          appendDentalLogout(defaults),
      },
    },
  ];
}
