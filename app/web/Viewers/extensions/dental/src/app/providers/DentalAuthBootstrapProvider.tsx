import React, { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSystem } from '@ohif/core';
import { useAppConfig } from '@state';
import { bootstrapDentalAuth } from '../../modules/auth/services/authApi';

type DentalAppConfig = AppTypes.Config & { dentalApiUrl?: string };

type DentalAuthBootstrapProviderProps = {
  children: React.ReactNode;
  service?: unknown;
};

/**
 * Boots dental JWT auth after UserAuthenticationProvider is mounted.
 * Registered via serviceProvidersManager in the dental extension preRegistration.
 */
function DentalAuthBootstrapProvider({ children }: DentalAuthBootstrapProviderProps) {
  const [appConfig] = useAppConfig();
  const { servicesManager } = useSystem();
  const { userAuthenticationService } = servicesManager.services;
  const dentalApiUrl = (appConfig as DentalAppConfig)?.dentalApiUrl;
  const hasOidc = Array.isArray(appConfig?.oidc) && appConfig.oidc.length > 0;
  const useDentalAuth = Boolean(dentalApiUrl) && !hasOidc;
  const [ready, setReady] = useState(!useDentalAuth);

  useLayoutEffect(() => {
    if (!useDentalAuth) {
      return;
    }

    bootstrapDentalAuth(userAuthenticationService);
    setReady(true);
  }, [useDentalAuth, userAuthenticationService]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}

DentalAuthBootstrapProvider.propTypes = {
  children: PropTypes.node,
  service: PropTypes.any,
};

export default DentalAuthBootstrapProvider;
