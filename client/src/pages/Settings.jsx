import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
const Settings = () => {
    const { logout } = useAuth();
    const token = localStorage.getItem('token');
    const [settings, setSettings] = useState({ namingConvention: '' });
    const { t } = useTranslation();



    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSettings(response.data);
            } catch (error) {
                if (error.response.status === 401) {
                    logout({ mode: 'bad_token' });
                    return;
                }
                console.error('Error fetching settings:', error);
                enqueueSnackbar(t('settings.fetch_failed'), { variant: 'error' });
            }
        }
        fetchSettings();
    }, [logout, token, t]);

    const handleNamingConventionChange = useCallback((event) => {
        setSettings((prevSettings) => ({
            ...prevSettings,
            namingConvention: event.target.value,
        }));
    }, []);
    const handleApplyClick = useCallback(async () => {
        try {
            await axios
                .put(`${process.env.REACT_APP_API_URL}/api/settings`, settings, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            enqueueSnackbar(t('settings.updated'), { variant: 'success' });
        } catch (error) {
            if (error.response.status === 401) {
                logout({ mode: 'bad_token' });
                return;
            }
            console.error('Error applying settings:', error);
            enqueueSnackbar(t('settings.update_failed'), { variant: 'error' });
        }
    }, [logout, settings, token, t]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 2,
                flexGrow: 1,
            }}
        >
            <Typography variant="h6" gutterBottom>
                {t('settings.settings')}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: 400 }}>
                <FormControl fullWidth>
                    <InputLabel id="naming-convention-label" >
                        {t('settings.naming_conventions')}
                    </InputLabel>
                    <Select
                        dir='ltr'
                        sx={{ mt: 1.3, ml: 1.5 }}
                        labelId="naming-convention-label"
                        id="naming-convention"
                        value={settings.namingConvention}
                        onChange={handleNamingConventionChange}
                    >
                        <MenuItem value="snake_case">{t('common.snake_case')}</MenuItem>
                        <MenuItem value="camelCase">{t('common.camel_case')}</MenuItem>
                        <MenuItem value="PascalCase">{t('common.pascal_case')}</MenuItem>
                        <MenuItem value="kebab-case">{t('common.kebab_case')}</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    sx={{ mt: 1.3 }}
                    variant="contained"
                    color="primary"
                    onClick={handleApplyClick}

                >
                    {t('common.apply')}
                </Button>
            </Box>
        </Box>
    );
};

export default Settings;
