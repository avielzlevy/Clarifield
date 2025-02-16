import React, { useEffect, useState } from 'react';
import { Button, Tooltip, Box } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import i18next from 'i18next';
import { useRtl } from '../contexts/RtlContext';
import ReactCountryFlag from "react-country-flag";

const countryMapping = {
    en: 'US', // or 'GB' depending on which English flag you want
    he: 'IL',
    ar: 'SA', // you might also consider 'AE' for UAE or another Arabic-speaking country
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

    const handleRtlSlowLoad = () => {
        setRtlLoading(true);
        setTimeout(() => {
            setRtlLoading(false);
        }, 500);
    };

    useEffect(() => {
        const rtlLangs = ['he', 'ar'];
        i18next.changeLanguage(selectedLang.code);
        localStorage.setItem('lang', selectedLang.code);
        handleRtlSlowLoad();
        setRtl(rtlLangs.includes(selectedLang.code));
    }, [selectedLang, setRtl]);

    const handleTooltipClose = () => setOpen(false);
    const handleTooltipOpen = () => setOpen(!open);
    const handleLanguageSelect = (lang) => {
        setSelectedLang(lang);
        setOpen(false);
    };

    return (
        <Box>
            <Tooltip
                slotProps={{
                    tooltip: {
                        sx: {
                            bgcolor: theme.palette.custom.light
                        }
                    },
                    arrow: {
                        sx: {
                            color: theme.palette.custom.light
                        }
                    }
                }}
                title={
                    <LanguageGrid >
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
                onOpen={handleTooltipOpen}
                arrow
                disableFocusListener
                disableHoverListener
                disableTouchListener
            >
                <Button
                    disableRipple
                    onClick={handleTooltipOpen}
                    sx={{
                        textTransform: 'none', fontSize: '2rem',
                        width: '2px',
                        height: '24px',
                        backgroundColor: 'transparent',
                        mb: '4px',
                    }}
                >
                    {selectedLang.flag}
                </Button>
            </Tooltip>
        </Box>
    );
}

export default LangDropdown;
