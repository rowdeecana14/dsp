import React from 'react';
import classNames from 'classnames';
import { useActiveTheme } from '@ohif/ui-next';
import DentalToothIcon from './DentalToothIcon';

type ThemeToggleProps = {
  onThemeChange?: (theme: string) => void;
};

function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const { activeTheme, setActiveTheme } = useActiveTheme();
  const isDental = activeTheme === 'dental';

  const select = (theme: 'dental' | 'default') => {
    setActiveTheme(theme);
    onThemeChange?.(theme);
  };

  return (
    <div
      className="bg-muted/40 border-border/50 relative inline-flex h-8 shrink-0 rounded-full border p-0.5"
      data-cy="dental-theme-toggle"
      role="group"
      aria-label="Viewer theme"
    >
      <span
        aria-hidden
        className={classNames(
          'bg-primary absolute top-0.5 bottom-0.5 w-[calc(50%-4px)] rounded-full shadow-sm transition-[left] duration-200 ease-out',
          isDental ? 'left-0.5' : 'left-[calc(50%+2px)]'
        )}
      />
      <button
        type="button"
        className={classNames(
          'relative z-10 flex h-7 min-w-[4.5rem] items-center justify-center gap-1 rounded-full px-2.5 text-[11px] font-medium transition-colors',
          isDental ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => select('dental')}
        title="Dental theme"
        aria-pressed={isDental}
      >
        <DentalToothIcon className="h-3 w-3" />
        Dental
      </button>
      <button
        type="button"
        className={classNames(
          'relative z-10 flex h-7 min-w-[4.5rem] items-center justify-center rounded-full px-2.5 text-[11px] font-medium transition-colors',
          !isDental ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => select('default')}
        title="Standard OHIF theme"
        aria-pressed={!isDental}
      >
        Standard
      </button>
    </div>
  );
}

export default ThemeToggle;
