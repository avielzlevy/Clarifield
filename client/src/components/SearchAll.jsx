import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useSearch } from '../contexts/SearchContext';
import { useTranslation } from 'react-i18next';
import {
  ImportContactsOutlined as ImportContacts,
  TextFieldsOutlined as TextFields,
  DataObject,
} from '@mui/icons-material';

export default function SearchAll({ setPage,refreshSearchables }) {
  const theme = useTheme();
  const [searchables, setSearchables] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState(null);
  // New state to force the dropdown to open when the button is clicked.
  const [forceOpen, setForceOpen] = useState(false);
  const { setSearch } = useSearch();
  const { t } = useTranslation();

  const fetchSearchables = async () => {
    try {
      const responseEntities = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
      const entities = responseEntities.data;
      const responseDefinitions = await axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`);
      const definitions = responseDefinitions.data;
      const responseFormats = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats`);
      const formats = responseFormats.data;
      const combinedSearchables = [
        ...Object.values(entities).map((entity) => ({ type: 'Entity', name: entity.label })),
        ...Object.keys(definitions).map((definition) => ({ type: 'Definition', name: definition })),
        ...Object.keys(formats).map((format) => ({ type: 'Format', name: format })),
      ];
      setSearchables(combinedSearchables);
    } catch (error) {
      console.error('Error fetching searchables:', error);
    }
  };

  useEffect(() => {
    fetchSearchables();
  }, [refreshSearchables]);

  const handleSelection = (event, newOption) => {
    if (!newOption) return;

    // Update the search context so other components can use it
    setSearch(newOption.name);

    // Switch pages based on the type of option selected
    if (newOption.type === 'Entity') {
      const index = searchables.findIndex(s => s.name === newOption.name);
      localStorage.setItem('reactFlowCenter', JSON.stringify({ x: index * 150, y: -200, zoom: 2 }));
      setPage('entities');
    } else if (newOption.type === 'Definition') {
      setPage('definitions');
    } else if (newOption.type === 'Format') {
      setPage('formats');
    }

    // Clear the input and close the dropdown
    setInputValue('');
    setValue(null);
    setForceOpen(false);
  };

  return (
    <Autocomplete
      freeSolo
      options={searchables}
      groupBy={(option) => option.type}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
      sx={{ width: 500 }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      value={value}
      onChange={handleSelection}
      // The dropdown opens if there's any input or if forceOpen is true.
      open={forceOpen || Boolean(inputValue)}
      // When the dropdown closes (e.g. user clicks away) we reset forceOpen.
      onClose={() => setForceOpen(false)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={t('search')}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 0.5, height: '10px', width: '15px' }}>
                  <SearchIcon />
                </InputAdornment>
              ),
              // Combine any existing endAdornment with our new button.
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <InputAdornment position="end">
                    <IconButton onClick={() => setForceOpen(true)}>
                      <ArrowDropDownIcon />
                    </IconButton>
                  </InputAdornment>
                </>
              ),
              type: 'search',
              size: 'small',
              sx: { borderRadius: '20px', marginRight: '10px' },
            },
          }}
        />
      )}
      renderGroup={(params) => {
        const { key, ...rest } = params;
        return (
          <div key={key} {...rest}>
            <Box sx={{ bgcolor: theme.palette.custom.light, display: 'flex', padding: 1, alignItems: 'center' }}>
              {params.group === 'Entity' ? (
                <DataObject sx={{ fontSize: '1.5rem', ml: 1 }} />
              ) : params.group === 'Definition' ? (
                <ImportContacts sx={{ fontSize: '1.5rem', ml: 1 }} />
              ) : params.group === 'Format' ? (
                <TextFields sx={{ fontSize: '1.5rem', ml: 1 }} />
              ) : null}
              <Typography sx={{ padding: '1px', fontWeight: 'bold', fontSize: '1rem', ml: 1 }}>
                {params.group}
              </Typography>
            </Box>
            {params.children}
          </div>
        );
      }}
    />
  );
}
