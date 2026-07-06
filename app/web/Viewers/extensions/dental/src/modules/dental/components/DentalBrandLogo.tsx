import React from 'react';
import { useDentalBranding } from '../hooks/useDentalBranding';

type DentalBrandLogoProps = {
  className?: string;
};

function DentalBrandLogo({ className = 'h-8 w-8 shrink-0 object-contain' }: DentalBrandLogoProps) {
  const { logoUrl } = useDentalBranding();

  return (
    <img
      src={logoUrl}
      alt=""
      className={className}
      data-cy="practice-logo"
    />
  );
}

export default DentalBrandLogo;
