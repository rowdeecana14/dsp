type ThemeSetter = (theme: string) => void;

const DENTAL_MODE_THEME = 'dental';

let themeSetter: ThemeSetter | null = null;
let pendingTheme: string | null = null;

function applyThemeToDom(theme: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const classList = document.body.classList;
  classList.forEach(cls => {
    if (cls.startsWith('theme-')) {
      classList.remove(cls);
    }
  });

  if (theme !== 'default') {
    classList.add(`theme-${theme}`);
  }

  if (theme === 'default') {
    localStorage.removeItem('ohif:theme');
  } else {
    localStorage.setItem('ohif:theme', theme);
  }
}

export function registerThemeSetter(setter: ThemeSetter): {
  unregister: () => void;
  flushedPending: boolean;
} {
  themeSetter = setter;

  const flushedPending = pendingTheme !== null;
  if (pendingTheme !== null) {
    setter(pendingTheme);
    pendingTheme = null;
  }

  return {
    flushedPending,
    unregister: () => {
      if (themeSetter === setter) {
        themeSetter = null;
      }
    },
  };
}

export function applyTheme(theme: string): void {
  if (themeSetter) {
    themeSetter(theme);
    pendingTheme = null;
    return;
  }

  pendingTheme = theme;
  applyThemeToDom(theme);
}

export function applyDentalModeTheme(): void {
  applyTheme(DENTAL_MODE_THEME);
}

export function getPendingTheme(): string | null {
  return pendingTheme;
}
