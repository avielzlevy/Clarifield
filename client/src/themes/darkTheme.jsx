// src/themes/darkTheme.js
import { createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    custom: {
      titleIcon: '#2dd4bf', // ADDED to lightTheme below for consistency
      bright: '#9333ea',
      light: '#3f3f46',
      dark: '#d7cde0',
      editor: '#1e1e1e',
    },
    primary: {
      main: '#7f56da',
    },
    background: {
      default: '#191919', // Main background for Dark
      paper: '#2c2c2c',   // Surfaces, cards
    },
    text: {
      primary: '#f3f4f6',   // Very light gray
      secondary: '#9ca3af', // Medium gray
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

export default darkTheme;
