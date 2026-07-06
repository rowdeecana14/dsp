import orchid from './orchid.json';
import arctic from './arctic.json';
import verdant from './verdant.json';
import midnight from './midnight.json';
import slate from './slate.json';
import deep from './deep.json';
import dental from './dental.json';

export interface ThemePreset {
  name: string;
  label: string;
  cssVars: {
    dark: Record<string, string>;
  };
}

export const themePresets: ThemePreset[] = [orchid, arctic, verdant, midnight, slate, deep, dental];
