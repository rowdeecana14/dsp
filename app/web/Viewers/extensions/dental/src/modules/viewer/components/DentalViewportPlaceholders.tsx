import React, { useEffect, useState } from 'react';
import { useSystem } from '@ohif/core';
import { useViewportGrid } from '@ohif/ui-next';

const DENTAL_VIEWPORT_LABELS: Record<string, string> = {
  'dental-current': 'Current image',
  'dental-prior': 'Prior exam (same modality)',
  'dental-bw-left': 'Bitewing — left',
  'dental-bw-right': 'Bitewing — right',
};

function DentalViewportPlaceholders() {
  const { servicesManager } = useSystem();
  const { displaySetService } = servicesManager.services;
  const [gridState] = useViewportGrid();
  const [layoutOptions, setLayoutOptions] = useState(
    servicesManager.services.viewportGridService.getLayoutOptionsFromState(gridState)
  );

  useEffect(() => {
    setLayoutOptions(
      servicesManager.services.viewportGridService.getLayoutOptionsFromState(gridState)
    );
  }, [gridState, servicesManager.services.viewportGridService]);

  const placeholders: Array<{
    viewportId: string;
    label: string;
    style: React.CSSProperties;
  }> = [];

  Array.from(gridState.viewports.entries()).forEach(([viewportId, viewport], index) => {
    const label = DENTAL_VIEWPORT_LABELS[viewportId];
    if (!label) {
      return;
    }

    const hasImage = (viewport.displaySetInstanceUIDs ?? []).some(uid => {
      const ds = displaySetService.getDisplaySetByUID(uid);
      return ds && !ds.unsupported;
    });

    if (hasImage) {
      return;
    }

    const layout = layoutOptions[index];
    if (!layout) {
      return;
    }

    placeholders.push({
      viewportId,
      label,
      style: {
        position: 'absolute',
        top: `${layout.y * 100}%`,
        left: `${layout.x * 100}%`,
        width: `${layout.width * 100}%`,
        height: `${layout.height * 100}%`,
      },
    });
  });

  if (!placeholders.length) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5]"
      data-cy="dental-viewport-placeholders"
    >
      {placeholders.map(({ viewportId, label, style }) => (
        <div
          key={viewportId}
          className="flex items-center justify-center p-2"
          style={style}
        >
          <div className="border-border bg-muted/30 text-muted-foreground flex max-w-[90%] flex-col items-center gap-1 rounded-md border border-dashed px-4 py-6 text-center">
            <span className="text-primary text-xs font-semibold uppercase tracking-wide">
              {label}
            </span>
            <span className="text-[10px]">No matching series</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DentalViewportPlaceholders;
