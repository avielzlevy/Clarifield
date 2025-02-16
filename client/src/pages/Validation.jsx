import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// Helper function to check if a string is valid JSON
const isValidJSON = (jsonString) => {
  if (!jsonString) return false;
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

// Function to validate JSON via an API call
const validateJSON = async (jsonString) => {
  try {
    // If the validation is successful, we assume no errors and return null
    await axios.post(`${process.env.REACT_APP_API_URL}/api/validate`, jsonString, {
      headers: { 'Content-Type': 'application/json' },
    });
    return null;
  } catch (error) {
    // Check for a 400 error and return the response if present
    if (error.response && error.response.status === 400) {
      return error.response;
    }
    // For other errors, log and return a generic error
    console.error('Validation error:', error);
    return { data: ['Unexpected error during validation.'] };
  }
};

function Validation() {
  const [errors, setErrors] = useState([]);
  const [schema, setSchema] = useState('');
  const theme = useTheme();
  const { t } = useTranslation();

  // Handler to validate schema changes
  const handleSchemaValidation = useCallback(async (value) => {
    setSchema(value);
    if (isValidJSON(value)) {
      const response = await validateJSON(value);
      if (response && response.data) {
        setErrors(response.data);
      } else {
        setErrors([]);
      }
    } else {
      setErrors([]);
    }
  }, []);

  // Compute validity once to avoid multiple calls in render
  const valid = isValidJSON(schema);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2,
        height: '87.5vh',
        m: 1,
      }}
    >
      {/* Editor Section */}
      <Box sx={{ flexGrow: 1 }} dir="ltr">
        <Editor
          width="100%"
          defaultLanguage="json"
          defaultValue=""
          value={schema}
          theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
          options={{ minimap: { enabled: false } }}
          onChange={(value) => handleSchemaValidation(value)}
        />
      </Box>

      {/* Validation Results Section */}
      <Box
        sx={{
          width: '50%',
          p: 2,
          overflow: 'auto',
          backgroundColor: theme.palette.custom.editor,
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t('validation_results')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {t('valid_object')}:{' '}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: valid ? 'green' : 'red',
              fontWeight: 'bold',
              ml: 1,
            }}
          >
            {valid ? t('true') : t('false')}
          </Typography>
        </Box>
        <Box mt={2}>
          <Typography variant="body1">{t('policy_violation')}:</Typography>
          <Box
          dir="ltr"
            sx={{
              color: 'red',
              fontWeight: 'bold',
              whiteSpace: 'pre-wrap',
              mt: 1,
            }}
          >
            {errors.map((error, index) => (
              <Typography
                key={index}
                variant="body1"
                sx={{ whiteSpace: 'pre-wrap', fontWeight: 'bold' }}
              >
                {`${index + 1}. ${error}`}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Validation;
