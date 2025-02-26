import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import DeleteDialog from '../components/DeleteDialog';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import DefinitionDialog from '../components/DefinitionDialog';
import { useAuth } from '../contexts/AuthContext';
import CustomDataGrid from '../components/CustomDataGrid';
import { enqueueSnackbar } from 'notistack';
import ReportDialog from '../components/ReportDialog';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useRtl } from '../contexts/RtlContext';
import { useSearch } from '../contexts/SearchContext';
import { useDefinitions } from '../contexts/useDefinitions';
function Definitions() {
  const { definitions, fetchDefinitions } = useDefinitions();
  const [DialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [actionedDefinition, setActionedDefinition] = useState(null);
  const { auth } = useAuth();
  const { setRefreshSearchables } = useSearch();
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

  const columns = [
    { field: 'name', headerName: t('name'), flex: 1, editable: true },
    {
      field: 'format',
      headerName: t('format'),
      flex: 1,
      editable: true,
    },
    { field: 'description', headerName: t('description'), flex: 2, editable: true },
  ];

  return (
    <Box sx={{ padding: 1, width: '100%' }}>
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
          handleDeleteRow={handleDeleteDialogClick}
          handleEditRow={handleEditDialogClick}
          handleReportRow={handleReportDialogClick}
          type="definition"
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
