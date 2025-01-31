// src/themes/darkTheme.js
import { createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f44336', // You can change this to any color you prefer
    },
    secondary: {
      main: '#90caf9', // Light blue
    },
  },
});

export default darkTheme;
