import { DentalMeasurementsToolbarButton } from '../../modules/dental';

export default function getToolbarModule() {
  return [
    {
      name: 'ohif.dentalMeasurementsButton',
      defaultComponent: DentalMeasurementsToolbarButton,
    },
  ];
}
