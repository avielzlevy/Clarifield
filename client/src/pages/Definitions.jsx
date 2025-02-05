import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import DeleteDialog from './DeleteDialog';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import DefinitionDialog from './DefinitionDialog';
import { useAuth } from '../contexts/AuthContext';
import CustomDataGrid from '../components/CustomDataGrid';
import { enqueueSnackbar } from 'notistack';
import ReportDialog from './ReportDialog';
import { useTranslation } from 'react-i18next';
import { sendAnalytics } from '../utils/analytics';



function Definitions() {
  const [definitions, setDefinitions] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const { t } = useTranslation();
  const [formats, setFormats] = useState({});
  const [DialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [actionedDefinition, setActionedDefinition] = useState(null);
  const [affected, setAffected] = useState(null);
  const { auth,logout } = useAuth();
  const token = localStorage.getItem('token');
  const fetchDefinitions = async () => {
    try {
      // Fetch definitions and formats
      const [definitionsRes, formatsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/formats`),
      ]);

      const definitionsData = definitionsRes.data;
      const formatsData = formatsRes.data;

      // Store formats for easy lookup
      setFormats(formatsData);

      // Convert definitions object to array
      const definitionsArray = Object.entries(definitionsData).map(
        ([name, defData], index) => ({
          id: name, // Use the name as the unique identifier
          name,
          format: defData.format,
          description: defData.description,
        })
      );

      setDefinitions(definitionsArray);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);


  const deleteDefinition = async (deletedDefintion) => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/definitions/${deletedDefintion.name}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.status === 401) {
        logout()
        return
      }
      setDefinitions((prev) => prev.filter((def) => def.name !== deletedDefintion.name));
      enqueueSnackbar('Definition deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setActionedDefinition(null);
    } catch (error) {
      console.error('Error deleting definition:', error);
      enqueueSnackbar('Error deleting definition', { variant: 'error' });
      setDeleteDialogOpen(false);
    }
  };

  const getAffected = async (definition) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/affected?format=${definition.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const affected = response.data;
      setAffected(affected);
    } catch (error) {
      if(error.response.status === 401){
        logout()
        return
      }
      else if (error.response.status === 404) {
        setAffected(null);
      } else {
        console.error('Error fetching affected:', error);
        enqueueSnackbar('Error fetching affected', { variant: 'error' });
      }
    }
  }

  const determineRegexType = (pattern) => {
    // Test strings for each data type
    const testValues = {
      integer: ['0', '-1', '42'],
      number: ['3.14', '-2.718', '0', '100', '-50'],
      boolean: ['true', 'false', 'True', 'FALSE', 'TRUE', 'False'],
      string: ['hello', 'world33', '123', 'true'],
    };

    // Function to test if regex matches all test strings for a data type
    const matchesAll = (values) =>
      values.every((value) => {
        const newRegex = new RegExp(pattern)
        return newRegex.test(value);
      });

    // Check for integer
    if (matchesAll(testValues.integer)) {
      return 'integer';
    }

    // Check for number
    if (matchesAll(testValues.number)) {
      return 'number';
    }

    // Check for boolean
    if (matchesAll(testValues.boolean)) {
      return 'boolean';
    }
    // Default to 'string' if no match
    return 'string';
  };

  function generateSampleObject(schema) {
    const sampleObject = {};

    schema.forEach(field => {
      const { name, type, format } = field;

      switch (type.toLowerCase()) {
        case 'string':
          if (format) {
            if (format === 'email') {
              sampleObject[name] = 'user@example.com';
            } else if (format.startsWith('^') && format.endsWith('$')) {
              // Simple heuristic based on regex pattern
              // For complex regex, consider using a library like randexp.js
              if (format === '^[a-zA-Z0-9_]+$') {
                sampleObject[name] = 'user_123';
              } else {
                sampleObject[name] = 'sampleString';
              }
            } else {
              sampleObject[name] = 'sampleString';
            }
          } else {
            sampleObject[name] = 'sampleString';
          }
          break;

        case 'number':
          sampleObject[name] = 42; // Example number
          break;

        case 'boolean':
          sampleObject[name] = true;
          break;

        case 'array':
          if (field.items && field.items.type) {
            // Generate a sample item based on the items' type
            sampleObject[name] = [generateSampleValue(field.items)];
          } else {
            sampleObject[name] = [];
          }
          break;

        case 'object':
          if (field.properties) {
            // Recursively generate the object based on its properties
            sampleObject[name] = generateSampleObject(field.properties);
          } else {
            sampleObject[name] = {};
          }
          break;

        default:
          sampleObject[name] = null; // Default to null if type is unrecognized
      }
    });

    return sampleObject;
  }

  /**
   * Generates a sample value based on the field definition.
   *
   * @param {Object} field - The field definition.
   * @returns {*} - A sample value matching the field's type and format.
   */
  function generateSampleValue(field) {
    const { type, format } = field;

    switch (type.toLowerCase()) {
      case 'string':
        if (format) {
          if (format === 'email') {
            return 'user@example.com';
          } else if (format.startsWith('^') && format.endsWith('$')) {
            if (format === '^[a-zA-Z0-9_]+$') {
              return 'user_123';
            } else {
              return 'sampleString';
            }
          } else {
            return 'sampleString';
          }
        } else {
          return 'sampleString';
        }

      case 'number':
        return 42;

      case 'boolean':
        return true;

      case 'array':
        if (field.items && field.items.type) {
          return [generateSampleValue(field.items)];
        } else {
          return [];
        }

      case 'object':
        if (field.properties) {
          return generateSampleObject(field.properties);
        } else {
          return {};
        }

      default:
        return null;
    }
  }

  const handleCopy = async (selectedData, type) => {
    const data = selectedData.map((def) => {
      const formatPattern = formats[def.format]?.pattern || 'Pattern not found';
      const regexType = determineRegexType(formatPattern);
      sendAnalytics(def.name, 'definition', 1)
      sendAnalytics(formatPattern, 'format', 1)
      return {
        name: def.name,
        type: regexType,
        format: formatPattern,
        description: def.description,
      };
    });
    if (!data || data.length === 0) {
      enqueueSnackbar('No data available to export.', { variant: 'warning' });
      return;
    }
    if (type === 'object') {
      const clipBoardData = JSON.stringify(data, null, 2);
      //this needs to be string at the end
      const clipboardItem = new ClipboardItem({ 'text/plain': new Blob([clipBoardData], { type: 'text/plain' }) });
      await navigator.clipboard.write([clipboardItem]);
      enqueueSnackbar('Data copied to clipboard!', { variant: 'success' });
    }
    else if (type === 'table') {
      try {
        // Extract headers
        const headers = Object.keys(data[0]);

        // Start constructing the HTML table
        let htmlTable = '<table border="1" cellspacing="0" cellpadding="5"><thead><tr>';

        // Add table headers
        //TODO: Add support for rtl
        headers.reverse().forEach(header => {
          htmlTable += `<th>${header}</th>`;
        });
        htmlTable += '</tr></thead><tbody>';

        // Add table rows
        data.forEach(row => {
          htmlTable += '<tr>';
          headers.forEach(header => {
            const cellData = row[header] !== null && row[header] !== undefined ? row[header] : '';
            htmlTable += `<td>${cellData}</td>`;
          });
          htmlTable += '</tr>';
        });
        htmlTable += '</tbody></table>';

        // Prepare clipboard items
        const blobHtml = new Blob([htmlTable], { type: 'text/html' });
        const blobText = new Blob([htmlTable.replace(/<\/?[^>]+(>|$)/g, "")], { type: 'text/plain' }); // Plain text fallback

        const clipboardItems = [
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ];

        // Write to clipboard
        await navigator.clipboard.write(clipboardItems);

        enqueueSnackbar('Table copied to clipboard!', { variant: 'success' });
      } catch (err) {
        console.error('Failed to copy: ', err);
        enqueueSnackbar('Failed to copy data to clipboard.', { variant: 'error' });
      }
    }
    else if (type === 'example') {
      const sampleData = generateSampleObject(data);
      const clipBoardData = JSON.stringify(sampleData, null, 2);
      const clipboardItem = new ClipboardItem({ 'text/plain': new Blob([clipBoardData], { type: 'text/plain' }) });
      await navigator.clipboard.write([clipboardItem]);
      enqueueSnackbar('Sample data copied to clipboard!', { variant: 'success' });
    }
  }



  const handleAddDialogClick = () => {
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditDialogClick = (definition) => {
    setDialogMode('edit');
    setActionedDefinition(definition);
    getAffected(definition);
    setDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setDialogMode(null);
    setAffected(null);
    setDialogOpen(false);
  };

  const handleDeleteDialogClick = (name) => {
    setActionedDefinition(name);
    getAffected(name);
    setDeleteDialogOpen(true);
  }

  const handleDeleteDialogClose = () => {
    setAffected(null);
    setDeleteDialogOpen(false);
  }

  const handleReportDialogClick = (definition) => {
    setActionedDefinition(definition);
    setReportDialogOpen(true);
  }

  const handleReportDialogClose = () => {
    setActionedDefinition(null);
    setReportDialogOpen(false);
  }

  const columns = [
    { field: 'name', headerName: t('name'), flex: 1, editable: true },
    {
      field: 'format',
      headerName: t('format'),
      flex: 1,
      renderCell: (params) => {
        const formatName = params.value;
        const formatPattern = formats[formatName]?.pattern || 'Pattern not found';
        const isPatternNotFound = formatPattern === 'Pattern not found';

        return (
          <Tooltip title={formatPattern}>
            <span style={{ color: isPatternNotFound ? 'red' : 'inherit' }}>{formatName}</span>
          </Tooltip>
        );
      },
      editable: true,
    },
    { field: 'description', headerName: t('description'), flex: 2, editable: true },
  ];

  return (
    <Box sx={{
      padding: '4px',
      width: '100%',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5">
          {t('definitions')}
        </Typography>
        {auth === true ? <IconButton
          color="primary"
          onClick={handleAddDialogClick}
          aria-label="Add record"
          size="small"
        >
          <AddIcon />
        </IconButton> : null}
      </Box>
      <Box sx={{ height: 500, width: '100%' }}>
        <CustomDataGrid
          rows={definitions}
          columns={columns}
          handleDeleteRow={handleDeleteDialogClick}
          handleEditRow={handleEditDialogClick}
          favorites={favorites}
          setFavorites={setFavorites}
          handleReportRow={handleReportDialogClick}
          onCopy={handleCopy}
          formats={formats}
        />
        <DefinitionDialog mode={dialogMode} open={DialogOpen} onClose={handleAddDialogClose} editedDefinition={actionedDefinition} affected={affected} refetch={fetchDefinitions} />
        <DeleteDialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} deletedItem={actionedDefinition} onDelete={deleteDefinition} />
        <ReportDialog open={reportDialogOpen} onClose={handleReportDialogClose} reportedItem={actionedDefinition} />
      </Box>
    </Box>
  );
}

export default Definitions;
