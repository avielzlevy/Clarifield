import React, { useEffect, useState } from 'react';
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
import { sendAnalytics } from '../utils/analytics';
function Definitions({ setRefreshSearchables }) {
  const [definitions, setDefinitions] = useState([]);
  const [formats, setFormats] = useState({});
  const [DialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [actionedDefinition, setActionedDefinition] = useState(null);
  const [affected, setAffected] = useState(null);
  const { auth, logout } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const { reverseWords } = useRtl();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDefinitions();
  }, []);

  const fetchDefinitions = async () => {
    try {
      const [definitionsRes, formatsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/formats`),
      ]);

      setFormats(formatsRes.data);

      const definitionsArray = Object.entries(definitionsRes.data).map(([name, defData]) => ({
        id: name,
        name,
        format: defData.format,
        description: defData.description,
      }));

      setDefinitions(definitionsArray);
    } catch (error) {
      console.error('Error fetching definitions:', error);
    }
  };

  // Fetch affected entities when actionedDefinition changes

  const getAffectedEntities = async (definition) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/affected?entity=${definition.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAffected(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: 'bad_token' });
        return;
      }
      setAffected(null);
      enqueueSnackbar('Error fetching affected entities', { variant: 'error' });
    }
  };

  const handleAddDialogClick = () => {
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditDialogClick = (definition) => {
    setDialogMode('edit');
    setActionedDefinition(definition);
    getAffectedEntities(definition);
    setDialogOpen(true);
  };

  const handleDeleteDialogClick = (definition) => {
    setActionedDefinition(definition);
    getAffectedEntities(definition);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDefinition = async () => {
    if (!actionedDefinition) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/definitions/${actionedDefinition.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDefinitions((prev) => prev.filter((def) => def.name !== actionedDefinition.name));
      enqueueSnackbar('Definition deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setActionedDefinition(null);
      setRefreshSearchables((prev) => prev + 1);
    } catch (error) {
      enqueueSnackbar('Error deleting definition', { variant: 'error' });
    }
  };

  const handleDeleteDialogClose = () => {
    setAffected(null);
    setDeleteDialogOpen(false);
  };

  const handleReportDialogClick = (definition) => {
    setActionedDefinition(definition);
    setReportDialogOpen(true);
  };

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
          rows={definitions}
          columns={columns}
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
          affected={affected}
          refetch={fetchDefinitions}
          setRefreshSearchables={setRefreshSearchables}
        />

        <DeleteDialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          deletedItem={actionedDefinition}
          onDelete={handleDeleteDefinition}
          affected={affected}
        />

        <ReportDialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} reportedItem={actionedDefinition} />
      </Box>
    </Box>
  );
}

export default Definitions;
