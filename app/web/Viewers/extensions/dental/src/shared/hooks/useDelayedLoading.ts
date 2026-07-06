import { useEffect, useState } from 'react';

/** Wait before showing loaders so fast requests do not flash UI. */
export const DENTAL_PANEL_LOADER_DELAY_MS = 400;

export function useDelayedLoading(
  isLoading: boolean,
  delayMs = DENTAL_PANEL_LOADER_DELAY_MS
): boolean {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowLoading(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isLoading, delayMs]);

  return showLoading;
}
