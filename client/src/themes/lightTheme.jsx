// src/themes/lightTheme.js
import { createTheme } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    custom: {
      titleIcon: '#2dd4bf', // ADDED for consistency with dark theme
      bright: '#9333ea',
      light: '#f3e8ff',
      dark: '#d7cde0',
      editor: '#fffffe',
    },
    primary: {
      main: '#7f56da',
    },
    background: {
      default: '#faf5ff',  // e.g. Tailwind's purple-50
      paper: '#ffffff',    // White for surfaces
    },
    text: {
      primary: '#111827',  // Near‐black
      secondary: '#6b7280', // Gray for subtext
    },
  },
  typography: {
    fontFamily: [
      'ui-sans-serif',
      'system-ui',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
      '"Android Emoji"',
      '"EmojiSymbols"',
    ].join(','),
    fontSize: 16,
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'inherit',
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#7f56da',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#6f44c9',
          },
        },
      },
    },
  },
});

export default lightTheme;
