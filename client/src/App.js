import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { PageProvider } from './contexts/PageContext';
import { AuthProvider } from './contexts/AuthContext';
import { RtlProvider, useRtl } from './contexts/RtlContext';
import darkTheme from './themes/darkTheme';
import lightTheme from './themes/lightTheme';
import NavBar from './components/NavBar';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { Height } from '@mui/icons-material';
import { SearchProvider } from './contexts/SearchContext';

// Create rtl cache
const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
  key: 'mui',
});

function App() {
  const [theme, setTheme] = useState(() => {
    const darkmode = localStorage.getItem('darkMode');
    return darkmode === 'true' ? darkTheme : lightTheme;
  });

  return (

    <PageProvider>
      <AuthProvider>
        <RtlProvider>
          <SearchProvider>
            <RtlConsumerComponent theme={theme} setTheme={setTheme} />
          </SearchProvider>
        </RtlProvider>
      </AuthProvider>
    </PageProvider>
  );
}

function RtlConsumerComponent({ theme, setTheme }) {
  const { rtl } = useRtl();

  return (
    <CacheProvider value={rtl ? rtlCache : ltrCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <GlobalStyles
            styles={{

              "::-webkit-scrollbar": {
                width: "3px",
                backgroundColor: "#f5f5f500",
              },
              /* Scrollbar track */
              "::-webkit-scrollbar-track": {
                // borderRadius: "10px",
                backgroundColor: "#ffffff00",
              },
              /* Scrollbar thumb */
              "::-webkit-scrollbar-thumb": {
                borderRadius: "40px",
                backgroundColor: "#848484cd",
              },
            }}
          />
          <NavBar theme={theme} setTheme={setTheme} language />
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;