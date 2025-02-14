// src/themes/lightTheme.js
import { createTheme } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    custom: {
      bright: '#9333ea',
      light: '#f3e8ff',
      dark: '#d7cde0',
      editor:'#fffffe',
    },
    primary: {
      // Purple accent used for buttons, active states
      main: '#7f56da',
    },
    background: {
      // Pastel‐lavender background
      default: '#faf5ff', // e.g. Tailwind's purple-50
      paper: '#ffffff',   // white for cards, surfaces
    },
    text: {
      primary: '#111827', // near‐black for headings
      secondary: '#6b7280', // gray for subtext
    },
  },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Android Emoji", "EmojiSymbols"',
    fontSize: 16,
  },
  components: {

    MuiAppBar: {
      defaultProps: {
        color: 'inherit', // so it uses the paper color instead of primary
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
