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

// Adjust these imports to your hook paths
import { useDefinitions } from '../contexts/useDefinitions';
import { useFormats } from '../contexts/useFormats';

const BASE_API_URL = process.env.REACT_APP_API_URL;

export default function ImportDialog({ open, setOpen, onFilesSelected }) {
  // Custom hooks to fetch available definitions and formats
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

  // Step 1: Process the file and initialize selection states
  const handleProcessFile = () => {
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parsedData = JSON.parse(text);

        setLoading(true);
        setLoadingMessage('Processing file...');

        // Call your process API endpoint
        const processResponse = await fetch(`${BASE_API_URL}/api/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData),
        });
        if (!processResponse.ok) {
          throw new Error('Error processing file');
        }
        const data = await processResponse.json();
        setProcessedData(data);

        // Initialize selected entities and store the fields (or empty array if missing)
        const entitiesSelection = {};
        const entityFields = {};
        Object.keys(data.entities).forEach((key) => {
          entitiesSelection[key] = true;
          entityFields[key] = data.entities[key].fields || [];
        });
        setSelectedEntities(entitiesSelection);
        setEntityFieldsOverrides(entityFields);

        // Initialize selected definitions and overrides for description and format
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

        // Move to the selection/edit step
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

  // Step 2: Build the payload and call the import API endpoint
  const handleImport = async () => {
    if (!processedData) return;

    // Filter entities based on user selection and include updated fields
    const filteredEntities = {};
    Object.keys(processedData.entities).forEach((key) => {
      if (selectedEntities[key]) {
        filteredEntities[key] = {
          ...processedData.entities[key],
          fields: entityFieldsOverrides[key],
        };
      }
    });

    // Filter definitions based on user selection and include updated format and description
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

    const payload = {
      entities: filteredEntities,
      definitions: filteredDefinitions,
    };

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

  // Render the file drop/upload step
  const renderStep1 = () => (
    <>
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
        {isDragActive ? (
          <Typography variant="body1">Drop the files here...</Typography>
        ) : (
          <Typography variant="body1">
            Drag & drop files here, or click to select files
          </Typography>
        )}
      </Box>
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Files:</Typography>
          <ul>
            {files.map((file) => (
              <li key={file.path || file.name}>
                {file.path || file.name}
              </li>
            ))}
          </ul>
        </Box>
      )}
    </>
  );

  // Render Entities Table
  const renderEntitiesTable = () => {
    // Combine the keys from processedData.definitions and availableDefinitions
    const processedDefKeys = processedData && processedData.definitions ? Object.keys(processedData.definitions) : [];
    const availableDefKeys = availableDefinitions ? Object.keys(availableDefinitions) : [];
    const combinedDefinitionOptions = Array.from(new Set([...processedDefKeys, ...availableDefKeys]));

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Entities
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Fields</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(processedData.entities).map((entityKey) => (
              <TableRow key={entityKey}>
                <TableCell>
                  <Checkbox
                    checked={selectedEntities[entityKey] || false}
                    onChange={(e) =>
                      setSelectedEntities((prev) => ({
                        ...prev,
                        [entityKey]: e.target.checked,
                      }))
                    }
                  />
                </TableCell>
                <TableCell>{entityKey}</TableCell>
                <TableCell>
                  <Autocomplete
                    multiple
                    options={combinedDefinitionOptions}
                    value={entityFieldsOverrides[entityKey] || []}
                    onChange={(e, newValue) => {
                      setEntityFieldsOverrides((prev) => ({
                        ...prev,
                        [entityKey]: newValue,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" size="small" placeholder="Select fields" />
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render Definitions Table
  const renderDefinitionsTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Definitions
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Select</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Format</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(processedData.definitions).map((defKey) => (
            <TableRow key={defKey}>
              <TableCell>
                <Checkbox
                  checked={selectedDefinitions[defKey] || false}
                  onChange={(e) =>
                    setSelectedDefinitions((prev) => ({
                      ...prev,
                      [defKey]: e.target.checked,
                    }))
                  }
                />
              </TableCell>
              <TableCell>{defKey}</TableCell>
              <TableCell>
                <Autocomplete
                  options={availableFormats || []}
                  value={definitionFormatsOverrides[defKey] || ''}
                  onChange={(event, newValue) => {
                    setDefinitionFormatsOverrides((prev) => ({
                      ...prev,
                      [defKey]: newValue,
                    }));
                  }}
                  freeSolo
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" size="small" />
                  )}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  size="small"
                  value={definitionOverrides[defKey] || ''}
                  onChange={(e) =>
                    setDefinitionOverrides((prev) => ({
                      ...prev,
                      [defKey]: e.target.value,
                    }))
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render the selection/edit step with the two tables
  const renderStep2 = () => (
    <Box>
      {renderEntitiesTable()}
      {renderDefinitionsTable()}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={step === 1 ? 'sm' : 'lg'}>
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
            {step === 2 && processedData && renderStep2()}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {step === 1 ? (
          <Button onClick={handleProcessFile} disabled={loading || files.length === 0}>
            Process File
          </Button>
        ) : (
          <Button onClick={handleImport} disabled={loading}>
            Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}