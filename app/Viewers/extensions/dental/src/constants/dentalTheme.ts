/**
 * Dental Theme Customization
 * Defines dental-specific colors and styling
 */

export default {
  'theme.colors': {
    $set: {
      primary: '#0066cc',      // Dental Blue
      secondary: '#f5f5f5',    // Off-white
      accent: '#ffa500',       // Warm Orange
      danger: '#d32f2f',       // Alert Red
      success: '#4caf50',      // Success Green
      warning: '#ff9800',      // Warning Orange
      info: '#2196f3',         // Info Blue
      background: '#fafafa',   // Light Gray
      foreground: '#333333',   // Dark Gray
      border: '#d0d0d0',       // Soft Gray
      textPrimary: '#1a1a1a',
      textSecondary: '#666666',
      surfaceLight: '#ffffff',
      surfaceDark: '#f0f0f0',
    },
  },
  'theme.fonts': {
    $set: {
      family: "'Inter', 'Helvetica', 'Arial', sans-serif",
      size: {
        xs: '11px',
        sm: '12px',
        base: '13px',
        lg: '14px',
        xl: '16px',
        '2xl': '18px',
      },
    },
  },
  'theme.spacing': {
    $set: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
    },
  },
  'theme.borderRadius': {
    $set: {
      sm: '2px',
      base: '4px',
      lg: '6px',
      full: '9999px',
    },
  },
  'theme.shadows': {
    $set: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      base: '0 2px 4px rgba(0, 0, 0, 0.1)',
      lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
      xl: '0 8px 16px rgba(0, 0, 0, 0.2)',
    },
  },
};
