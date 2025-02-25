import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Checkbox, Box, Button, Menu, MenuItem, Tooltip } from '@mui/material';
import {
  Trash2 as Trash,
  Pencil,
  Heart,
  Flag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { sendAnalytics } from '../utils/analytics';
import { useSearch } from '../contexts/SearchContext';
import { useTheme } from '@mui/material/styles';

function CustomDataGrid(props) {
  const {
    rows,
    columns,
    handleDeleteRow,
    handleEditRow,
    handleReportRow,
    onCopy,
    type,
  } = props;

  const { auth } = useAuth();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { search, setSearch } = useSearch();
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [locale, setLocale] = useState(undefined);

  // -- Handlers --

  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleCopyClick = useCallback(
    (type) => {
      if (onCopy) {
        const selectedData = rows.filter((row) => selectedRows.has(row.id));
        onCopy(selectedData, type);
      }
      handleMenuClose();
    },
    [onCopy, rows, selectedRows, handleMenuClose]
  );

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleCheckboxChange = useCallback((id) => {
    setSelectedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
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
    );
  }, [rows, columns, searchTerm]);

  // Build columns with additional checkbox and actions columns
  const columnsWithCheckbox = useMemo(() => {
    let baseColumns = [];
    // Append the provided columns
    baseColumns = baseColumns.concat(columns);

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
            <Tooltip title="Report" arrow>
              <Flag style={{ cursor: 'pointer', fill: 'black' }} onClick={() => handleReportRow(params.row)} />
            </Tooltip>
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
        {selectedRows.size > 0 && onCopy && (
          <Box>
            <Button variant="contained" color="primary" onClick={handleMenuOpen}>
              Copy
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleCopyClick('table')}>Copy as Table</MenuItem>
              <MenuItem onClick={() => handleCopyClick('object')}>Copy as Object</MenuItem>
              <MenuItem onClick={() => handleCopyClick('example')}>Copy as Example</MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
      <DataGrid
        rows={filteredRows}
        columns={columnsWithCheckbox}
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
        onCellClick={(params) => {
          if (params.value) {
            navigator.clipboard.writeText(params.value);
            sendAnalytics(params.row.id, type, 1);
            enqueueSnackbar('Copied to clipboard', { variant: 'success' });
          }
        }}
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
