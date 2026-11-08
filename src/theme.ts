import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0a0a0a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0a0a0a',
      secondary: '#737373',
    },
    divider: '#f0f0f0',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 52,
          paddingLeft: 24,
          paddingRight: 24,
          transition: 'all 0.15s ease-in-out',
        },
        outlined: {
          borderColor: '#e5e5e5',
          color: '#0a0a0a',
          '&:hover': {
            borderColor: '#0a0a0a',
            backgroundColor: '#fafafa',
          },
        },
        contained: {
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#262626',
          },
        },
      },
    },
  },
});

