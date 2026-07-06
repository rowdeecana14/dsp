import DentalViewerLayout from '../layouts/ViewerLayout';

/**
 * Dental-mode viewer layout only. Basic/longitudinal modes use the default
 * OHIF ViewerLayout + ViewerHeader via their own layoutTemplateModule.
 */
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
