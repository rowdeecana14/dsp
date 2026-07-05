import DentalViewerLayout from './layout/DentalViewerLayout';

export default function getLayoutTemplateModule({
  servicesManager,
  extensionManager,
  commandsManager,
  hotkeysManager,
}) {
  function DentalViewerLayoutWithServices(props) {
    return DentalViewerLayout({
      servicesManager,
      extensionManager,
      commandsManager,
      hotkeysManager,
      ...props,
    });
  }

  return [
    {
      name: 'dentalViewerLayout',
      id: 'dentalViewerLayout',
      component: DentalViewerLayoutWithServices,
    },
  ];
}
