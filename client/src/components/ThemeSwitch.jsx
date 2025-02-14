import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { LightModeOutlined as LightMode, DarkModeOutlined as DarkMode } from '@mui/icons-material';
import darkTheme from '../themes/darkTheme';
import lightTheme from '../themes/lightTheme';

function ThemeButton(props) {
  const { theme, setTheme } = props;
  const [fade, setFade] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState({});

  const changeTheme = (newTheme) => {
    // Only apply fade if we're going from dark to light
    if (theme.palette.mode === 'dark' && newTheme === 'light') {
      setOverlayStyle({
        backgroundColor: theme.palette.background.default,
        opacity: 1,
        transition: 'opacity 1000ms ease-in',
      });
      setFade(true);

      // Allow the overlay to be visible before switching themes
      setTimeout(() => {
        switch (newTheme) {
          case 'dark':
            setTheme(darkTheme);
            localStorage.setItem('darkMode', 'true');
            break;
          case 'light':
            setTheme(lightTheme);
            localStorage.setItem('darkMode', 'false');
            break;
          default:
            break;
        }
        // Fade out the overlay
        setOverlayStyle((prev) => ({ ...prev, opacity: 0 }));

        // Remove overlay after the fade-out transition completes
        setTimeout(() => {
          setFade(false);
        }, 1000);
      }, 100);
    } else {
      // Simply change the theme if not going from dark to light
      switch (newTheme) {
        case 'dark':
          setTheme(darkTheme);
          localStorage.setItem('darkMode', 'true');
          break;
        case 'light':
          setTheme(lightTheme);
          localStorage.setItem('darkMode', 'false');
          break;
        default:
          break;
      }
    }
  };

  const handleClick = () => {
    const nextTheme = theme.palette.mode === 'dark' ? 'light' : 'dark';
    changeTheme(nextTheme);
  };

  return (
    <div style={{ position: 'relative' }}>
      <IconButton disableRipple onClick={handleClick}>
        {theme.palette.mode === 'dark' ? (
          <LightMode sx={{ color: '#FFD242' }} />
        ) : (
          <DarkMode sx={{ color: 'black' }} />
        )}
      </IconButton>
      {fade && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.2,
            ...overlayStyle,
            pointerEvents: 'none',
            zIndex: 1300,
          }}
        />
      )}
    </div>
  );
}

export default ThemeButton;
