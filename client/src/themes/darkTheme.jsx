// src/themes/darkTheme.js
import { createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    custom: {
      titleIcon: '#2dd4bf',
      bright: '#9333ea',
      light: '#3f3f46',
      dark: '#d7cde0',
    },
    primary: {
      // Same purple accent for brand
      main: '#7f56da',
      // main: '#9333ea',
    },
    background: {
      default: '#191919', // main background
      paper: '#2c2c2c',   // card surfaces, etc.
    },
    text: {
      primary: '#f3f4f6',   // very light gray (off‐white)
      secondary: '#9ca3af', // medium gray
    },
  },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Android Emoji", "EmojiSymbols"',
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
