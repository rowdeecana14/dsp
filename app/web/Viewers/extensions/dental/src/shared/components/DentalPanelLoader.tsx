import React from 'react';
import { Icons } from '@ohif/ui-next';
import { dentalPanelMetaTextClassName } from './dentalPanelStyles';

type DentalPanelLoaderProps = {
  label?: string;
  compact?: boolean;
  className?: string;
};

function DentalPanelLoader({
  label = 'Loading…',
  compact = false,
  className = '',
}: DentalPanelLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${compact ? 'py-4' : 'py-8'} ${className}`}
      data-cy="dental-panel-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Icons.LoadingSpinner className="text-primary h-6 w-6" />
      {label ? (
        <p className={`${dentalPanelMetaTextClassName} text-xs`}>{label}</p>
      ) : null}
    </div>
  );
}

export default DentalPanelLoader;
