import { applyDentalTheme } from './components/DentalThemeToggle';

export default function getCustomizationModule() {
  return [
    {
      name: 'dental',
      value: {
        'dental.theme': 'clinical',
        'measurementLabels': {
          $set: ['PA length', 'Canal angle', 'Crown width', 'Root length'],
        },
      },
    },
    {
      name: 'default',
      value: {
        'ohif.hotkeyBindings': {
          $push: [
            {
              commandName: 'exportDentalMeasurementsJson',
              label: 'Export dental measurements JSON',
              keys: ['Ctrl', 'Shift', 'E'],
            },
          ],
        },
      },
    },
  ];
}

export { applyDentalTheme };
