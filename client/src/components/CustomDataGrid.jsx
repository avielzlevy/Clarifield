import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Box, Tooltip, Typography } from '@mui/material';
import {
  Trash2 as Trash,
  Pencil,
  Copy,
  Flag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { sendAnalytics } from '../utils/analytics';
import { useSearch } from '../contexts/SearchContext';
import { useFormats } from '../contexts/useFormats';

function CustomDataGrid(props) {
  const {
    rows,
    columns,
    handleDeleteRow,
    handleEditRow,
    handleReportRow,
    type,
  } = props;

  const { auth } = useAuth();
  const { t, i18n } = useTranslation();
  const { search, setSearch } = useSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { formats } = useFormats();
  const [locale, setLocale] = useState(undefined);
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Update viewport size on window resize
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to external search changes
  useEffect(() => {
    if (search) {
      console.log('Search term:', search);
      setSearchTerm(search);
      setSearch('');
    }
  }, [search, setSearch]);

  // Load locale for DataGrid based on i18n language
  useEffect(() => {
    const loadLocale = async () => {
      switch (i18n.language) {
        case 'he': {
          const { heIL } = await import('@mui/x-data-grid/locales');
          setLocale(heIL.components.MuiDataGrid.defaultProps.localeText);
          break;
        }
        case 'ar': {
          const { arSD } = await import('@mui/x-data-grid/locales');
          setLocale(arSD.components.MuiDataGrid.defaultProps.localeText);
          break;
        }
        case 'de': {
          const { deDE } = await import('@mui/x-data-grid/locales');
          setLocale(deDE.components.MuiDataGrid.defaultProps.localeText);
          break;
        }
        case 'es': {
          const { esES } = await import('@mui/x-data-grid/locales');
          setLocale(esES.components.MuiDataGrid.defaultProps.localeText);
          break;
        }
        case 'fr': {
          const { frFR } = await import('@mui/x-data-grid/locales');
          setLocale(frFR.components.MuiDataGrid.defaultProps.localeText);
          break;
        }
        default:
          setLocale(undefined);
      }
    };
    loadLocale();
  }, [i18n.language]);

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter((row) =>
      columns.some((col) =>
        String(row[col.field]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [rows, columns, searchTerm]);

  // Build columns with additional checkbox and actions columns
  const columnsWithCopy = useMemo(() => {
    let baseColumns = [];
    // Append the provided columns
    baseColumns = baseColumns.concat(
      columns.map((col) => ({
        ...col,
        renderCell: (params) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              minHeight: '40px', // Ensures row height consistency
              gap: 1,
            }}
          >
            {params.value && (
              <Tooltip title="Copy" arrow>
                <Copy
                  style={{ cursor: 'pointer', minWidth: '16px', minHeight: '16px' }}
                  size={16}
                  onClick={() => {
                    navigator.clipboard.writeText(params.value);
                    enqueueSnackbar('Copied to clipboard', { variant: 'success' });
                    sendAnalytics(params.row.id, type, 1);
                  }}
                />
              </Tooltip>
            )}
            <Typography variant="subtitle" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {params.value || null}
            </Typography>
          </Box>
        ),
      }))
    );

    baseColumns = baseColumns.map((col) => {

      if (col.field === 'format') {
        return {
          ...col,
          renderCell: (params) => {
            const formatName = params.value;
            const formatPattern = formats[formatName]?.pattern || 'Pattern not found';
            const isPatternNotFound = formatPattern === 'Pattern not found';
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  minHeight: '40px', // Ensures row height consistency
                  gap: 1,
                }}
              >
                {params.value && (
                  <Tooltip title="Copy" arrow>
                    <Copy
                      style={{ cursor: 'pointer', minWidth: '16px', minHeight: '16px' }}
                      size={16}
                      onClick={() => {
                        navigator.clipboard.writeText(params.value);
                        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
                        sendAnalytics(params.row.id, type, 1);
                      }}
                    />
                  </Tooltip>
                )}
                <Tooltip title={formatPattern}>
                  <Typography variant="subtitle" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isPatternNotFound ? 'red' : 'inherit' }}>
                    {params.value || null}
                  </Typography>
                </Tooltip>
              </Box>
            )
          }
        }
      }
      return col;
    }
    );
    // Define the actions column
    const actionsColumn = {
      field: 'actions',
      headerName: t('actions'),
      sortable: false,
      width: 80,
      disableColumnMenu: true,
      renderCell: (params) => {
        return auth ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: '100%',
              mt: 1.5,
            }}
          >
            <Tooltip title="Edit" arrow>
              <Pencil style={{ cursor: 'pointer' }} onClick={() => handleEditRow(params.row)} />
            </Tooltip>
            <Tooltip title="Delete" arrow>
              <Trash style={{ cursor: 'pointer' }} onClick={() => handleDeleteRow(params.row)} />
            </Tooltip>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: '100%',
              mt: 0.75,
            }}
          >
            <Flag style={{ cursor: 'pointer', fill: 'black' }} onClick={() => handleReportRow(params.row)} />
          </Box>
        );
      },
    };

    return [...baseColumns, actionsColumn];
  }, [
    columns,
    auth,
    t,
    handleEditRow,
    handleDeleteRow,
    handleReportRow,
    type,
    formats,
  ]);

  return (
    <Box sx={{ mt: 0.5 }}>
      {/* Search input */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextField
          label={t('filter')}
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ maxWidth: 500 }}
        />
      </Box>
      <DataGrid
        rows={filteredRows}
        columns={columnsWithCopy}
        pageSize={10}
        rowsPerPageOptions={[50]}
        slotProps={{
          pagination: { direction: 'rtl' },
        }}
        getRowId={(row) => row.id}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        disableRowSelectionOnClick
        disable
        localeText={locale}
        isCellEditable={() => false}
        sx={{
          height: 'calc(100vh - 200px)',
          width: '100%',
          '& .MuiDataGrid-cell': { outline: 'none' },
        }}
        key={`${viewportSize.width}-${viewportSize.height}`}
      />
    </Box>
  );
}

export default CustomDataGrid;
