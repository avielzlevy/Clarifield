// src/components/SignIn.js
import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import axios from 'axios';
import { usePage } from '../contexts/PageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack'; // Correct import for useSnackbar
import { useTranslation } from 'react-i18next';

function SignIn() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { setPage } = usePage();
  const { setAuth } = useAuth();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar(); // Access enqueueSnackbar via useSnackbar

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/signin`, credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      setAuth(true);
      enqueueSnackbar(t('signed_in'), { variant: 'success' });
      setPage('home');
    } catch (error) {
      console.error('Authentication failed', error);
      // Extract a more specific error message if available
      const message = error.response?.data?.message || 'Authentication failed';
      enqueueSnackbar(t('sign_in_failed', { message }), { variant: 'error' });
    }
  };

  return (
    <Container sx={{ mt: 8 }}>
      <Box
        component="form"
        onSubmit={handleSignIn}
        noValidate
        autoComplete="off"
        sx={{
          display: 'flex',
          flexDirection: 'column', // Arrange items vertically
          alignItems: 'center',    // Center items horizontally
          gap: 2,                  // Space between elements
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('sign_in')}
        </Typography>
        <TextField
          label={t('user_name')}
          fullWidth
          required
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        />
        <TextField
          label={t('password')}
          type="password"
          fullWidth
          required
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        <Button variant="contained" color="primary" type="submit" fullWidth>
          {t('sign_in')}
        </Button>
      </Box>
    </Container>
  );
}

export default SignIn;
