import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles'; // ← type-only import

export const getTheme = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#1A1A1A', // Black instead of blue
      light: '#333333',
      dark: '#000000',
    },
    secondary: {
      main: '#D32F2F', // Red for critical
      light: '#E53935',
      dark: '#C62828',
    },
    success: {
      main: '#2E7D32', // Green for compliant
      light: '#388E3C',
      dark: '#1B5E20',
    },
    warning: {
      main: '#ED6C02', // Orange for warnings
      light: '#F57C00',
      dark: '#E65100',
    },
    error: {
      main: '#D32F2F',
    },
    info: {
      main: '#757575', // Gray for info
    },
    background: {
      default: mode === 'light' ? '#F5F7FA' : '#121212',
      paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
    },
    text: {
    primary: mode === 'light' ? '#1A1A1A' : '#E8E8E8',  // Lighter for dark mode
    secondary: mode === 'light' ? '#757575' : '#B0B0B0', // Lighter for dark mode
  },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 2px 12px rgba(0,0,0,0.06)' 
            : '0 2px 12px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'light'
              ? '0 8px 24px rgba(0,0,0,0.10)'
              : '0 8px 24px rgba(0,0,0,0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 2px 12px rgba(0,0,0,0.06)' 
            : '0 2px 12px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${mode === 'light' ? '#E0E0E0' : '#333333'}`,
        },
      },
    },
  },
});

export const lightTheme = createTheme(getTheme('light'));
export const darkTheme = createTheme(getTheme('dark'));