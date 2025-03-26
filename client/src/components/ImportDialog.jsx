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
  Stack,
} from '@mui/material';
import Loading from './Loading';
import { useDefinitions } from '../contexts/useDefinitions';
import { useFormats } from '../contexts/useFormats';

const BASE_API_URL = process.env.REACT_APP_API_URL;

export default function ImportDialog({ open, setOpen, onFilesSelected }) {
  const { definitions: availableDefinitions } = useDefinitions();
  const { formats: availableFormats } = useFormats();

  // file related states
  const [files, setFiles] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [detectedType, setDetectedType] = useState(null);

  // ui state
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  // steps: 1 = file select, 2 = processed (waiting for review/import), 3 = review table (final confirmation)
  const [step, setStep] = useState(1);

  // data coming from process API
  const [processedData, setProcessedData] = useState(null);
  // states for table review
  const [selectedEntities, setSelectedEntities] = useState({});
  const [selectedDefinitions, setSelectedDefinitions] = useState({});
  const [definitionOverrides, setDefinitionOverrides] = useState({});
  const [definitionFormatsOverrides, setDefinitionFormatsOverrides] = useState({});
  const [entityFieldsOverrides, setEntityFieldsOverrides] = useState({});

  const onClose = useCallback(() => {
    setOpen(false);
    setFiles([]);
    setParsedData(null);
    setDetectedType(null);
    setStep(1);
    setProcessedData(null);
  }, [setOpen]);

  // Only allow one file in the dropzone
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setFiles([file]);
      if (onFilesSelected) {
        onFilesSelected([file]);
      }
      // Read file immediately to detect file type
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const json = JSON.parse(text);
          const type = detectFileType(json);
          setDetectedType(type);
          setParsedData(json);
        } catch (err) {
          console.error('Error reading file:', err);
          setDetectedType(null);
          setParsedData(null);
        }
      };
      reader.onerror = (err) => {
        console.error('File reading error:', err);
      };
      reader.readAsText(file);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  // Function to detect file type based on file content
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

  // Process file using API endpoint /api/process/{type}
  const handleProcessFile = async () => {
    if (!parsedData || !detectedType) return;
    setLoading(true);
    setLoadingMessage(`Processing ${detectedType} file...`);

    try {
      const processResponse = await fetch(
        `${BASE_API_URL}/api/process/${detectedType}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData),
        }
      );
      if (!processResponse.ok) {
        throw new Error(`Error processing ${detectedType} file`);
      }
      const data = await processResponse.json();
      setProcessedData(data);

      // Initialize selections (all checked by default)
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

      // Move to next step: processed complete (waiting for user to review)
      setStep(2);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Final import call using API endpoint /api/import
  const handleImport = async () => {
    if (!processedData) return;

    // Filter entities and definitions based on user selections
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

    setLoading(true);
    setLoadingMessage('Importing data...');
    try {
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

  // Helper functions to update selection states for review table
  const toggleEntitySelection = (key) => {
    setSelectedEntities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDefinitionSelection = (key) => {
    setSelectedDefinitions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllEntities = () => {
    if (processedData) {
      const all = {};
      Object.keys(processedData.entities).forEach((key) => {
        all[key] = true;
      });
      setSelectedEntities(all);
    }
  };

  const deselectAllEntities = () => {
    if (processedData) {
      const none = {};
      Object.keys(processedData.entities).forEach((key) => {
        none[key] = false;
      });
      setSelectedEntities(none);
    }
  };

  const selectAllDefinitions = () => {
    if (processedData) {
      const all = {};
      Object.keys(processedData.definitions).forEach((key) => {
        all[key] = true;
      });
      setSelectedDefinitions(all);
    }
  };

  const deselectAllDefinitions = () => {
    if (processedData) {
      const none = {};
      Object.keys(processedData.definitions).forEach((key) => {
        none[key] = false;
      });
      setSelectedDefinitions(none);
    }
  };

  // Render step 1: File selection and display file info
  const renderStep1 = () => (
    <Box>
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
        {files.length > 0 ?
          <Box mt={2}>
            <Typography variant="subtitle1">Selected File: {files[0].name}</Typography>
            <Typography variant="subtitle2">
              Detected Type:{' '}
              {detectedType ? detectedType : 'Could not detect file type'}
            </Typography>
          </Box> :
          <>
            <input {...getInputProps()} />
            <Typography variant="body1">
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag & drop a file here, or click to select one'}
            </Typography></>
        }
      </Box>
    </Box>
  );

  // Render step 2: Show processing complete message with option to review
  const renderStep2 = () => (
    <Box textAlign="center">
      <Typography variant="body1">
        File processed successfully.
      </Typography>
    </Box>
  );

  // Render step 3: Review table to toggle unwanted entities/definitions
  const renderReviewTable = () => (
    <Box>
      <Typography variant="h6" mt={2}>
        Entities
      </Typography>
      <Stack direction="row" spacing={2} mb={1}>
        <Button onClick={selectAllEntities} size="small">
          Select All
        </Button>
        <Button onClick={deselectAllEntities} size="small">
          Deselect All
        </Button>
      </Stack>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Select</TableCell>
              <TableCell>Entity Name</TableCell>
              <TableCell>Fields</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(processedData.entities).map((entity) => (
              <TableRow key={entity}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedEntities[entity] || false}
                    onChange={() => toggleEntitySelection(entity)}
                  />
                </TableCell>
                <TableCell>{entity}</TableCell>
                <TableCell>
                  {(processedData.entities[entity].fields || []).join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" mt={2}>
        Definitions
      </Typography>
      <Stack direction="row" spacing={2} mb={1}>
        <Button onClick={selectAllDefinitions} size="small">
          Select All
        </Button>
        <Button onClick={deselectAllDefinitions} size="small">
          Deselect All
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Select</TableCell>
              <TableCell>Definition Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Format</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(processedData.definitions).map((def) => (
              <TableRow key={def}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedDefinitions[def] || false}
                    onChange={() => toggleDefinitionSelection(def)}
                  />
                </TableCell>
                <TableCell>{def}</TableCell>
                <TableCell>
                  <TextField
                    value={definitionOverrides[def] || ''}
                    onChange={(e) =>
                      setDefinitionOverrides((prev) => ({
                        ...prev,
                        [def]: e.target.value,
                      }))
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={definitionFormatsOverrides[def] || ''}
                    onChange={(e) =>
                      setDefinitionFormatsOverrides((prev) => ({
                        ...prev,
                        [def]: e.target.value,
                      }))
                    }
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Import Files</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Loading />
            <Typography variant="body1" mt={2}>
              {loadingMessage}
            </Typography>
          </Box>
        ) : (
          <>
            {step === 1 && renderStep1()}
            {step === 2 && processedData && renderStep2()}
            {step === 3 && processedData && renderReviewTable()}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {step === 1 && (
          <Button
            onClick={handleProcessFile}
            disabled={loading || files.length === 0 || !detectedType}
          >
            Process File
          </Button>
        )}
        {step === 2 && (
          <Button onClick={() => setStep(3)} disabled={loading}>
            Review &amp; Import
          </Button>
        )}
        {step === 3 && (
          <>
            <Button onClick={() => setStep(2)} disabled={loading}>
              Back
            </Button>
            <Button onClick={handleImport} disabled={loading}>
              Confirm Import
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
