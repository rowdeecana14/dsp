type DentalNotificationType = 'success' | 'error' | 'info' | 'warning';

type DentalNotificationOptions = {
  title: string;
  message?: string;
  type?: DentalNotificationType;
};

export function showDentalNotification(
  servicesManager: AppTypes.ServicesManager,
  { title, message = '', type = 'info' }: DentalNotificationOptions
): void {
  const { uiNotificationService } = servicesManager.services;
  uiNotificationService?.show({
    title,
    message,
    type,
  });
}

export function showDentalSuccessNotification(
  servicesManager: AppTypes.ServicesManager,
  title: string,
  message?: string
): void {
  showDentalNotification(servicesManager, { title, message, type: 'success' });
}

export function showDentalErrorNotification(
  servicesManager: AppTypes.ServicesManager,
  title: string,
  message?: string
): void {
  showDentalNotification(servicesManager, { title, message, type: 'error' });
}
