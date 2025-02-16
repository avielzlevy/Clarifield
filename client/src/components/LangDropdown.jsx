import React, { useEffect, useState, useCallback } from 'react';
import { Button, Tooltip, Box } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import i18next from 'i18next';
import { useRtl } from '../contexts/RtlContext';
import ReactCountryFlag from "react-country-flag";

const countryMapping = {
  en: 'US', // or 'GB' depending on which English flag you want
  he: 'IL',
  ar: 'SA', // or consider 'AE' for UAE or another Arabic-speaking country
  es: 'ES',
  fr: 'FR',
  de: 'DE',
};

const languages = [
  { code: 'en', flag: '🇺🇸' },
  { code: 'he', flag: '🇮🇱' },
  { code: 'ar', flag: '🇸🇦' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'de', flag: '🇩🇪' },
];

const LanguageGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  maxWidth: 135,
  gap: theme.spacing(1),
  padding: theme.spacing(1),
}));

const LanguageItem = styled(Box)(({ theme, selected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 29,
  height: 24,
  margin: 2,
  borderRadius: '20%',
  fontSize: '1.5rem',
  cursor: 'pointer',
  fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `2px solid transparent`,
  transition: 'border-color 0.3s',
  '&:hover': {
    borderColor: theme.palette.primary.light,
  },
}));

function LangDropdown() {
  const [open, setOpen] = useState(false);
  const { setRtl, setRtlLoading } = useRtl();
  const theme = useTheme();

  const [selectedLang, setSelectedLang] = useState(() => {
    const lang = localStorage.getItem('lang');
    return lang ? languages.find((l) => l.code === lang) : languages[0];
  });

  // Memoize the RTL slow load handler
  const handleRtlSlowLoad = useCallback(() => {
    setRtlLoading(true);
    setTimeout(() => {
      setRtlLoading(false);
    }, 500);
  }, [setRtlLoading]);

  useEffect(() => {
    const rtlLangs = ['he', 'ar'];
    i18next.changeLanguage(selectedLang.code);
    localStorage.setItem('lang', selectedLang.code);
    handleRtlSlowLoad();
    setRtl(rtlLangs.includes(selectedLang.code));
  }, [selectedLang, handleRtlSlowLoad, setRtl]);

  const handleTooltipClose = useCallback(() => setOpen(false), []);
  const handleTooltipToggle = useCallback(() => setOpen((prev) => !prev), []);
  const handleLanguageSelect = useCallback((lang) => {
    setSelectedLang(lang);
    setOpen(false);
  }, []);

  return (
    <Box>
      <Tooltip
        slotProps={{
          tooltip: {
            sx: { bgcolor: theme.palette.custom?.light || theme.palette.background.paper },
          },
          arrow: {
            sx: { color: theme.palette.custom?.light || theme.palette.background.paper },
          },
        }}
        title={
          <LanguageGrid>
            {languages.map((lang) => (
              <LanguageItem
                key={lang.code}
                selected={lang.code === selectedLang.code}
                onClick={() => handleLanguageSelect(lang)}
              >
                <ReactCountryFlag
                  countryCode={countryMapping[lang.code]}
                  svg
                  style={{
                    borderRadius: '7px',
                    width: '1.05em',
                    height: '1.05em',
                  }}
                  title={lang.code}
                />
              </LanguageItem>
            ))}
          </LanguageGrid>
        }
        open={open}
        onClose={handleTooltipClose}
        onOpen={handleTooltipToggle}
        arrow
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        <Button
          disableRipple
          onClick={handleTooltipToggle}
          sx={{
            textTransform: 'none',
            fontSize: '2rem',
            width: '2px',
            height: '24px',
            backgroundColor: 'transparent',
            mb: '4px',
          }}
        >
          <ReactCountryFlag
            countryCode={countryMapping[selectedLang.code]}
            svg
            style={{
              borderRadius: '7px',
              width: '1.05em',
              height: '1.05em',
            }}
            title={selectedLang.code}
          />
        </Button>
      </Tooltip>
    </Box>
  );
}

export default LangDropdown;
