import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Box, Tooltip, Typography } from '@mui/material';
import { Trash2 as Trash, Pencil, Copy, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { sendAnalytics } from '../utils/analytics';
import { useSearch } from '../contexts/SearchContext';
import { useFormats } from '../contexts/useFormats';

function CustomDataGrid({ rows, columns, handleDeleteRow, handleEditRow, handleReportRow, type }) {
  const { auth } = useAuth();
  const { t, i18n } = useTranslation();
  const { search, setSearch } = useSearch();
  const { formats } = useFormats();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch locale dynamically based on language
  const [locale, setLocale] = useState(undefined);

  useEffect(() => {
    const loadLocale = async () => {
      const locales = {
        he: () => import('@mui/x-data-grid/locales').then((m) => m.heIL.components.MuiDataGrid.defaultProps.localeText),
        ar: () => import('@mui/x-data-grid/locales').then((m) => m.arSD.components.MuiDataGrid.defaultProps.localeText),
        de: () => import('@mui/x-data-grid/locales').then((m) => m.deDE.components.MuiDataGrid.defaultProps.localeText),
        es: () => import('@mui/x-data-grid/locales').then((m) => m.esES.components.MuiDataGrid.defaultProps.localeText),
        fr: () => import('@mui/x-data-grid/locales').then((m) => m.frFR.components.MuiDataGrid.defaultProps.localeText),
      };
      setLocale(await (locales[i18n.language] || (() => Promise.resolve(undefined)))());
    };
    loadLocale();
  }, [i18n.language]);

  useEffect(() => {
    if (search) {
      setSearchTerm(search);
      setSearch('');
    }
  }, [search, setSearch]);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter((row) =>
      columns.some((col) => String(row[col.field] || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [rows, columns, searchTerm]);


  const columnsWithCopy = useMemo(() => {
    const baseColumns = columns.map((col) => ({
      ...col,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1,justifyContent:"center",mt: 1.5, }}>
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
          <Typography
            variant="subtitle2"
            sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {params.value || null}
          </Typography>
        </Box>
      ),
    }));

    const enhancedColumns = baseColumns.map((col) =>
      col.field === 'format'
        ? {
          ...col,
          renderCell: (params) => {
            const formatPattern = formats[params.value]?.pattern || 'Pattern not found';
            return (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:"center",
                mt: 1.5,
                width: '100%',
                gap: 1,
              }}>
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
                  <Typography
                    variant="subtitle2"
                    sx={{
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: formatPattern === 'Pattern not found' ? 'red' : 'inherit',
                    }}
                  >
                    {params.value || null}
                  </Typography>
                </Tooltip>
              </Box>
            );
          },
        }
        : col
    );

    return [
      ...enhancedColumns,
      {
        field: 'actions',
        headerName: t('actions'),
        sortable: false,
        width: 80,
        disableColumnMenu: true,
        renderCell: (params) =>
          auth ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%',alignItems:"center",mt: 1.5, }}>
              <Tooltip title="Edit" arrow>
                <Pencil style={{ cursor: 'pointer' }} onClick={() => handleEditRow(params.row)} />
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <Trash style={{ cursor: 'pointer' }} onClick={() => handleDeleteRow(params.row)} />
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%',alignItems:"center",mt: 1.5, }}>
              <Flag style={{ cursor: 'pointer', fill: 'black' }} onClick={() => handleReportRow(params.row)} />
            </Box>
          ),
      },
    ];
  }, [columns, auth, t, handleEditRow, handleDeleteRow, handleReportRow, type, formats]);

  return (
    <Box sx={{ mt: 0.5 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        disableRowSelectionOnClick
        localeText={locale}
        isCellEditable={() => false}
        sx={{
          height: 'calc(100vh - 200px)',
          width: '100%',
          '& .MuiDataGrid-cell': { outline: 'none' },
        }}
        key={`${window.innerWidth}-${window.innerHeight}`}
      />
    </Box>
  );
}

export default CustomDataGrid;
