// src/themes/lightTheme.js
import { createTheme } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Default Material-UI blue
    },
    secondary: {
      main: '#f50057', // Pink
    },
  },
});

export default lightTheme;
