import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
} from '@mui/material';
import Loading from './Loading';
import { useDefinitions } from '../contexts/useDefinitions';
import { useFormats } from '../contexts/useFormats';

const BASE_API_URL = process.env.REACT_APP_API_URL;

export default function ImportDialog({ open, setOpen, onFilesSelected }) {
  const { definitions: availableDefinitions } = useDefinitions();
  const { formats: availableFormats } = useFormats();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [step, setStep] = useState(1);
  const [processedData, setProcessedData] = useState(null);
  const [selectedEntities, setSelectedEntities] = useState({});
  const [selectedDefinitions, setSelectedDefinitions] = useState({});
  const [definitionOverrides, setDefinitionOverrides] = useState({});
  const [definitionFormatsOverrides, setDefinitionFormatsOverrides] = useState({});
  const [entityFieldsOverrides, setEntityFieldsOverrides] = useState({});

  const onClose = useCallback(() => {
    setOpen(false);
    setFiles([]);
    setStep(1);
    setProcessedData(null);
  }, [setOpen]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles(acceptedFiles);
      if (onFilesSelected) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const detectFileType = (jsonData) => {
    if (jsonData?.info?.schema?.includes('https://schema.getpostman.com')) {
      return 'postman';
    } else if (jsonData?.swagger === '2.0') {
      return 'swagger';
    } else if (jsonData?.openapi?.startsWith('3.')) {
      return 'openapi';
    }
    return null;
  };

  const handleProcessFile = () => {
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parsedData = JSON.parse(text);

        const fileType = detectFileType(parsedData);
        if (!fileType) {
          throw new Error('Unsupported file type');
        }

        setLoading(true);
        setLoadingMessage(`Processing ${fileType} file...`);

        const processResponse = await fetch(`${BASE_API_URL}/api/process/${fileType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData),
        });

        if (!processResponse.ok) {
          throw new Error(`Error processing ${fileType} file`);
        }

        const data = await processResponse.json();
        setProcessedData(data);

        const entitiesSelection = {};
        const entityFields = {};
        Object.keys(data.entities).forEach((key) => {
          entitiesSelection[key] = true;
          entityFields[key] = data.entities[key].fields || [];
        });
        setSelectedEntities(entitiesSelection);
        setEntityFieldsOverrides(entityFields);

        const definitionsSelection = {};
        const descriptionOverrides = {};
        const formatOverrides = {};
        Object.keys(data.definitions).forEach((key) => {
          definitionsSelection[key] = true;
          descriptionOverrides[key] = data.definitions[key].description || '';
          formatOverrides[key] = data.definitions[key].format || '';
        });
        setSelectedDefinitions(definitionsSelection);
        setDefinitionOverrides(descriptionOverrides);
        setDefinitionFormatsOverrides(formatOverrides);

        setStep(2);
      } catch (error) {
        console.error('Processing failed:', error);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!processedData) return;

    const filteredEntities = {};
    Object.keys(processedData.entities).forEach((key) => {
      if (selectedEntities[key]) {
        filteredEntities[key] = {
          ...processedData.entities[key],
          fields: entityFieldsOverrides[key],
        };
      }
    });

    const filteredDefinitions = {};
    Object.keys(processedData.definitions).forEach((key) => {
      if (selectedDefinitions[key]) {
        filteredDefinitions[key] = {
          ...processedData.definitions[key],
          format: definitionFormatsOverrides[key],
          description: definitionOverrides[key],
        };
      }
    });

    const payload = { entities: filteredEntities, definitions: filteredDefinitions };

    try {
      setLoading(true);
      setLoadingMessage('Importing data...');

      const importResponse = await fetch(`${BASE_API_URL}/api/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!importResponse.ok) {
        throw new Error('Error importing data');
      }

      const importResult = await importResponse.json();
      console.log('Import successful:', importResult);
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed #ccc',
        borderRadius: 2,
        padding: 4,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#f0f0f0' : '#fafafa',
      }}
    >
      <input {...getInputProps()} />
      <Typography variant="body1">
        {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select files'}
      </Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Import Files</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Loading />
            <Typography variant="body1">{loadingMessage}</Typography>
          </Box>
        ) : (
          <>
            {step === 1 && renderStep1()}
            {step === 2 && processedData && <Typography variant="body1">Data processed successfully.</Typography>}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        {step === 1 ? (
          <Button onClick={handleProcessFile} disabled={loading || files.length === 0}>Process File</Button>
        ) : (
          <Button onClick={handleImport} disabled={loading}>Import</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
