import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useEffect } from 'react';
import ChangeWarning from '../components/ChangeWarning';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

function FormatDialog({ mode, open, onClose, editedFormat, affected, refetch }) {
  const [format, setFormat] = useState({ name: '', pattern: '', description: '' });
  const [patternError, setPatternError] = useState('');
  const { logout } = useAuth();
  const token = localStorage.getItem('token');
  const { t } = useTranslation();



  useEffect(() => {
    if (editedFormat) {
      setFormat(editedFormat);
    }
  }, [editedFormat,token])
  const handleSubmit = async () => {
    // Regex validation: ensure pattern starts with ^ and ends with $
    try {
      if(!format.pattern.startsWith('^') || !format.pattern.endsWith('$')){
        setPatternError(t('pattern_boundaries_error'));
        return;
      }
      const regexPattern = new RegExp(format.pattern);
      regexPattern.test('');
    } catch (e) {
      setPatternError(t('pattern_invalid_error'));
      return;
    }

    try {
      await axios[mode === 'add' ? 'post' : 'put'](`${process.env.REACT_APP_API_URL}/api/formats${mode === 'add' ? '' : `/${format.name}`}`, format, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refetch();
      setFormat({ name: '', pattern: '', description: '' });
      onClose();
    } catch (error) {
      if (error.response.status === 401) {
        logout();
        return;
      }
      else if (error.response.status === 409) {
        enqueueSnackbar(t('format_exists_error'), { variant: 'error' });
        setFormat({ name: '', pattern: '', description: '' });
      }
      else {
        console.error(`Error ${mode === 'add' ? 'adding' : 'editing'} format:`, error);
        enqueueSnackbar(`Error ${mode === 'add' ? 'adding' : 'editing'} format`, { variant: 'error' });
        setFormat({ name: '', pattern: '', description: '' });
      }
    }
  };

  const handleCancel = () => {
    setFormat({ name: '', pattern: '', description: '' });
    onClose();
  }

  const handlePatternChange = (e) => {
    setFormat({ ...format, pattern: e.target.value });
    setPatternError(''); // Clear error on change
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === 'add' ? 'Add Format' : 'Edit Format'}
        {affected && <ChangeWarning items={affected} level={'warning'} />}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please fill out the details below to {mode === 'add' ? 'add a new' : 'edit the'
          } format.{'\n'}The pattern must be a valid regular expression enclosed with ^ and $.
        </DialogContentText>
        <TextField
          label="Name"
          disabled={mode === 'edit'}
          fullWidth
          margin="normal"
          value={format.name}
          onChange={(e) => setFormat({ ...format, name: e.target.value })}
        />
        <TextField
          label="Pattern"
          fullWidth
          margin="normal"
          value={format.pattern}
          onChange={handlePatternChange}
          error={!!patternError}
          helperText={patternError}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={format.description}
          onChange={(e) => setFormat({ ...format, description: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormatDialog;
