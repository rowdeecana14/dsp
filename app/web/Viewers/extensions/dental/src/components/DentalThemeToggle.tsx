import React from 'react';
import { Button, Icons } from '@ohif/ui-next';

export type DentalTheme = 'clinical' | 'standard';

interface DentalThemeToggleProps {
  theme: DentalTheme;
  onToggle: (theme: DentalTheme) => void;
}

export default function DentalThemeToggle({ theme, onToggle }: DentalThemeToggleProps) {
  const isDental = theme === 'clinical';

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-1 ${isDental ? 'text-dental-accent' : ''}`}
      onClick={() => onToggle(isDental ? 'standard' : 'clinical')}
      data-cy="dental-theme-toggle"
      title={isDental ? 'Switch to standard theme' : 'Enable Dental Mode theme'}
    >
      <Icons.ToolLayout className="h-4 w-4" />
      <span className="text-xs font-semibold">{isDental ? 'Dental Mode' : 'Standard'}</span>
    </Button>
  );
}

export function applyDentalTheme(theme: DentalTheme) {
  const root = document.documentElement;
  if (theme === 'clinical') {
    root.classList.add('dental-mode');
    root.style.setProperty('--primary', '174 72% 40%');
    root.style.setProperty('--primary-foreground', '0 0% 100%');
    root.style.setProperty('--accent', '174 45% 92%');
    root.style.setProperty('--background', '180 20% 98%');
    root.style.setProperty('--foreground', '200 25% 15%');
    root.style.setProperty('--muted', '180 15% 94%');
    root.style.setProperty('--muted-foreground', '200 10% 45%');
    root.style.setProperty('--border', '174 30% 85%');
  } else {
    root.classList.remove('dental-mode');
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-foreground');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--background');
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--muted');
    root.style.removeProperty('--muted-foreground');
    root.style.removeProperty('--border');
  }
}
