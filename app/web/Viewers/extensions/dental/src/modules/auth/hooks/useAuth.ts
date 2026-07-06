import { useCallback, useEffect } from 'react';
import { useUserAuthentication } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { bootstrapDentalAuth, login, logout, signOutAndRedirect } from '../services/authApi';

export function useAuth() {
  const [{ user }, authApi] = useUserAuthentication();
  const { servicesManager } = useSystem();
  const { userAuthenticationService } = servicesManager.services;

  return {
    user,
    authApi,
    userAuthenticationService,
    login,
    logout: () => logout(userAuthenticationService),
    signOutAndRedirect,
    bootstrap: () => bootstrapDentalAuth(userAuthenticationService),
  };
}

export function useAuthBootstrap() {
  const { bootstrap } = useAuth();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);
}
