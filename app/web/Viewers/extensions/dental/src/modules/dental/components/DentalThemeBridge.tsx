import { useEffect } from 'react';
import { useActiveTheme } from '@ohif/ui-next';
import { registerThemeSetter } from '../../../shared/utils/themeBridge';

/**
 * Connects OHIF ActiveThemeProvider to dental mode commands and applies the dental
 * theme when the dental viewer layout mounts (after onModeEnter may have queued it).
 */
function DentalThemeBridge() {
  const { setActiveTheme } = useActiveTheme();

  useEffect(() => {
    const { unregister, flushedPending } = registerThemeSetter(setActiveTheme);

    if (!flushedPending) {
      setActiveTheme('dental');
    }

    return unregister;
  }, [setActiveTheme]);

  return null;
}

export default DentalThemeBridge;
