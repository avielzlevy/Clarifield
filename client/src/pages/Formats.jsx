import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import FormatDialog from './FormatDialog';
import ReportDialog from './ReportDialog';
import { useAuth } from '../contexts/AuthContext';
import CustomDataGrid from '../components/CustomDataGrid';
import DeleteDialog from './DeleteDialog';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

function Formats() {
  const [formats, setFormats] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [actionedFormat, setActionedFormat] = useState(null);
  const [affected, setAffected] = useState(null);
  const { auth,logout } = useAuth();
  const token = localStorage.getItem('token');
  const { t } = useTranslation();

  const fetchFormats = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats`);
      const formatsData = response.data;

      // Convert formats object to array
      const formatsArray = Object.entries(formatsData).map(([name, formatData]) => ({
        id: name, // Use the name as the unique identifier
        name,
        pattern: formatData.pattern,
        description: formatData.description,
      }));

      setFormats(formatsArray);
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  useEffect(() => {
    fetchFormats();
  }, []);

  const deleteFormat = async (deletedFormat) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/formats/${deletedFormat.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormats((prevFormats) => prevFormats.filter((format) => format.name !== deletedFormat.name));
      enqueueSnackbar('Format deleted successfully', { variant: 'success' });
      handleDeleteDialogClose();
      setActionedFormat(null);
    } catch (error) {
      if (error.response.status === 401) {
        logout()
        return;
      }
      console.error('Error deleting format:', error);
      enqueueSnackbar('Default format cannot be deleted', { variant: 'error' });
      handleDeleteDialogClose();
    }
  };

  const getAffected = async (format) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/affected?format=${format.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const affected = response.data;
      setAffected(affected);
    } catch (error) {
      if (error.response.status === 401) {
        logout()
        return;
      }
      else if (error.response.status === 404) {
        setAffected(null);
      } else {
        console.error('Error fetching affected:', error);
        enqueueSnackbar('Error fetching affected', { variant: 'error' });
      }
    }
  }

  const handleAddDialogClick = () => {
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditDialogClick = (format) => {
    setDialogMode('edit');
    setActionedFormat(format);
    getAffected(format);
    setDialogOpen(true);
  }
  const handleDeleteDialogClick = (format) => {
    setActionedFormat(format);
    getAffected(format);
    setDeleteDialogOpen(true);
  }

  const handleAddDialogClose = () => {
    setDialogMode(null);
    setAffected(null);
    setDialogOpen(false);
  }

  const handleDeleteDialogClose = () => {
    setAffected(null);
    setDeleteDialogOpen(false);
  }

  const handleReportDialogClick = (format) => {
    setActionedFormat(format);
    setReportDialogOpen(true);
  }

  const handleReportDialogClose = () => {
    setActionedFormat(null);
    setReportDialogOpen(false);
  }

  const columns = [
    { field: 'name', headerName: t('name'), flex: 1 },
    {
      field: 'pattern', headerName: t('pattern'), flex: 2,
      renderCell: (params) => (
        <Typography variant="body2" sx={{
          marginTop: '3%',
          // display:'flex',
          // alignItems:'center',
          // justifyContent:'center',
        }} dir='ltr'>
          {params.value}
        </Typography>
      )
    },
    { field: 'description', headerName: t('description'), flex: 2 },
  ];

  return (
    <Box sx={{
      padding: '4px',
      width: '100%',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {t('formats')}
        </Typography>
        {auth === true ? <IconButton
          color="primary"
          onClick={handleAddDialogClick}
          aria-label="Add format"
          size="small"
        >
          <AddIcon />
        </IconButton> : null}
      </Box>
      <Box sx={{ height: 500, width: '100%' }}>
        <CustomDataGrid rows={formats} columns={columns} handleDeleteRow={handleDeleteDialogClick} handleEditRow={handleEditDialogClick} handleReportRow={handleReportDialogClick} />
        <FormatDialog mode={dialogMode} open={dialogOpen} onClose={handleAddDialogClose} editedFormat={actionedFormat} affected={affected} refetch={fetchFormats} />
        <DeleteDialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} deletedItem={actionedFormat} onDelete={deleteFormat} affected={affected} />
        <ReportDialog open={reportDialogOpen} onClose={handleReportDialogClose} reportedItem={actionedFormat} />
      </Box>
    </Box>
  );
}

export default Formats;
