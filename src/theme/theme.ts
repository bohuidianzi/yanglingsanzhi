import { createTheme } from '@mui/material/styles';
import { V2_COLORS } from './colors';

const theme = createTheme({
  palette: {
    primary: {
      main: V2_COLORS.primary.main,
      light: V2_COLORS.primary.light,
      dark: V2_COLORS.primary.dark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: V2_COLORS.secondary.main,
      light: V2_COLORS.secondary.light,
      dark: V2_COLORS.secondary.dark,
      contrastText: '#FFFFFF',
    },
    success: {
      main: V2_COLORS.success.main,
      light: V2_COLORS.success.light,
      dark: V2_COLORS.success.dark,
    },
    background: {
      default: V2_COLORS.background.default,
      paper: V2_COLORS.background.paper,
    },
    text: {
      primary: V2_COLORS.text.primary,
      secondary: V2_COLORS.text.secondary,
      disabled: V2_COLORS.text.disabled,
    },
    divider: V2_COLORS.divider,
  },
  typography: {
    fontFamily: '"Noto Sans SC", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;
