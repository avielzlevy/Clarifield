import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Button,
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
import { useTheme } from '@mui/material/styles';
import { useRtl } from '../contexts/RtlContext';
import { useSearch } from '../contexts/SearchContext';
import { sendAnalytics } from '../utils/analytics';
import { determineRegexType, generateSampleObject } from '../utils/clipboardUtils';
import { useDefinitions } from '../contexts/useDefinitions';
import { useFormats } from '../contexts/useFormats';
function Definitions() {
  const { definitions, fetchDefinitions } = useDefinitions();
  const { formats } = useFormats();
  const [DialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [actionedDefinition, setActionedDefinition] = useState(null);
  const { auth } = useAuth();
  const { setRefreshSearchables } = useSearch();
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const { t } = useTranslation();
  const theme = useTheme();
  const { reverseWords } = useRtl();
  const token = localStorage.getItem('token');

  const rows = useMemo(() =>
    Object.entries(definitions).map(([name, defData]) => ({
      id: name,
      name,
      format: defData.format,
      description: defData.description,
    })),
    [definitions]
  );

  const handleAddDialogClick = () => {
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditDialogClick = async (definition) => {
    setDialogMode('edit');
    setActionedDefinition(definition);
    setDialogOpen(true);
  };

  const handleDeleteDialogClick = (definition) => {
    setActionedDefinition(definition);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDefinition = async () => {
    if (!actionedDefinition) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/definitions/${actionedDefinition.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDefinitions();
      enqueueSnackbar('Definition deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setActionedDefinition(null);
      setRefreshSearchables((prev) => prev + 1);
    } catch (error) {
      enqueueSnackbar('Error deleting definition', { variant: 'error' });
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleReportDialogClick = (definition) => {
    setActionedDefinition(definition);
    setReportDialogOpen(true);
  };

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
        // // TODO: Add support for rtl
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
    <Box sx={{ padding: '4px', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          {t('definitions')}
        </Typography>
        {auth && (
          <Button
            sx={{ backgroundColor: theme.palette.custom.bright, borderRadius: 3, textTransform: 'none' }}
            onClick={handleAddDialogClick}
            aria-label="new-definition"
            variant="contained"
            startIcon={<AddIcon />}
          >
            {reverseWords(`${t('new')} ${t('definition')}`)}
          </Button>
        )}
      </Box>
      <Box sx={{ height: 500, width: '100%' }}>
        <CustomDataGrid
          rows={rows}
          columns={columns}
          favorites={favorites}
          setFavorites={setFavorites}
          handleDeleteRow={handleDeleteDialogClick}
          handleEditRow={handleEditDialogClick}
          handleReportRow={handleReportDialogClick}
          formats={formats}
        />
        <DefinitionDialog
          mode={dialogMode}
          open={DialogOpen}
          onClose={() => setDialogOpen(false)}
          editedDefinition={actionedDefinition}
        />

        <DeleteDialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          deletedItem={actionedDefinition}
          onDelete={handleDeleteDefinition}
          type="definition"
        />

        <ReportDialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} reportedItem={actionedDefinition} />
      </Box>
    </Box>
  );
}

export default Definitions;
