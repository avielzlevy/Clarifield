import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { Autocomplete } from '@mui/material'; // Import Autocomplete
import axios from 'axios';
import { enqueueSnackbar } from 'notistack'; // Import useSnackbar
import { useAuth } from '../contexts/AuthContext'; // Import logout

function DefinitionDialog({ mode, open, onClose, editedDefinition, refetch,setRefreshSearchables }) {
  const [definition, setDefinition] = useState({ name: '', format: '', description: '' });
  const [formats, setFormats] = useState([]);
  const [namingConvention, setNamingConvention] = useState('');
  const [namingConventionError, setNamingConventionError] = useState('');
  const { logout } = useAuth();

  const fetchFormats = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats`);
      const formatsData = response.data;
      const formatNames = Object.keys(formatsData).sort();
      setFormats(formatNames);
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  useEffect(() => {
    fetchFormats();
    if (editedDefinition) {
      setDefinition(editedDefinition)
    }
    const token = localStorage.getItem('token');
    const fetchNamingConvention = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNamingConvention(response.data.namingConvention);
      } catch (error) {
        if (error.response.status === 401) {
          logout({ mode: 'bad_token' });
          return
        }
        console.error('Error fetching naming convention:', error);
        enqueueSnackbar('Error fetching naming convention', { variant: 'error' });
      }
    };
    fetchNamingConvention();
  }, [editedDefinition,logout]);

  const handleSubmit = async () => {


    // Naming convention validation
    if (namingConvention) {
      switch (namingConvention) {
        case 'snake_case':
          if (!definition.name.match(/^[a-z0-9_]+$/)) {
            setNamingConventionError('Name must be in snake_case');
            return;
          }
          break;
        case 'camelCase':
          if (!definition.name.match(/^[a-z]+([A-Z][a-z]*)*$/)) {
            setNamingConventionError('Name must be in camelCase');
            return;
          }
          break;
        case 'PascalCase':
          if (!definition.name.match(/^[A-Z][a-z]+([A-Z][a-z]*)*$/)) {
            setNamingConventionError('Name must be in PascalCase');
            return;
          }
          break;
        case 'kebab-case':
          if (!definition.name.match(/^[a-z0-9-]+$/)) {
            setNamingConventionError('Name must be in kebab-case');
            return;
          }
          break;
        default:
          break
      }
    }


    try {
      await axios[mode === 'add' ? 'post' : 'put'](`${process.env.REACT_APP_API_URL}/api/definitions${mode === 'add' ? '' : `/${definition.name}`}`, definition, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      refetch();
      setDefinition({ name: '', format: '', description: '' });
      onClose()
      setRefreshSearchables((prev) => prev+1)
    } catch (error) {
      if (error.response.status === 401) {
        logout({ mode: 'bad_token' });
        return;
      }
      else if (error.response.status === 409) {
        enqueueSnackbar('Definition already exists', { variant: 'error' });
        setDefinition({ name: '', format: '', description: '' });
      }
      else {
        console.error(`Error ${mode === 'add' ? 'adding' : 'editing'} definition:`, error);
        enqueueSnackbar(`Error ${mode === 'add' ? 'adding' : 'editing'} definition`, { variant: 'error' });
        setDefinition({ name: '', format: '', description: '' });
      }
    }
  };

  const handleCancel = () => {
    setDefinition({ name: '', format: '', description: '' });
    onClose();
  }

  const handleNameChange = (e) => {
    setDefinition({ ...definition, name: e.target.value });
    setNamingConventionError(''); // Clear error on change
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'add' ? 'Add Definition' : 'Edit Definition'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please fill out the details below to {mode === 'add' ? 'add' : 'edit'} a definition
        </DialogContentText>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={definition.name}
          error={!!namingConventionError}
          helperText={namingConventionError}
          onChange={handleNameChange}
          disabled={mode === 'edit'}
        />
        <Autocomplete
          options={formats}
          getOptionLabel={(option) => option}
          value={definition.format}
          onChange={(e, newValue) => setDefinition({ ...definition, format: newValue || '' })}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Format"
              fullWidth
              margin="normal"
              placeholder="Select a format"
            />
          )}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={definition.description}
          onChange={(e) => setDefinition({ ...definition, description: e.target.value })}
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

export default DefinitionDialog;
