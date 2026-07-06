import React, { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { bootstrapDentalAuth } from '../services/authApi';

type DentalAuthGateProps = {
  children: React.ReactNode;
  userAuthenticationService: {
    set: (state: { enabled?: boolean; user?: unknown }) => void;
    setServiceImplementation: (impl: Record<string, unknown>) => void;
    reset: () => void;
  };
  dentalApiUrl?: string;
  oidc?: unknown[];
};

/**
 * Boots dental JWT auth after UserAuthenticationProvider is mounted, then renders
 * children. Without this gate, preRegistration runs before React auth state exists
 * and PrivateRoute never enables the login redirect.
 */
function DentalAuthGate({
  children,
  userAuthenticationService,
  dentalApiUrl,
  oidc,
}: DentalAuthGateProps) {
  const useDentalAuth = Boolean(dentalApiUrl) && !(oidc && oidc.length > 0);
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

DentalAuthGate.propTypes = {
  children: PropTypes.node,
  userAuthenticationService: PropTypes.object.isRequired,
  dentalApiUrl: PropTypes.string,
  oidc: PropTypes.array,
};

export default DentalAuthGate;
