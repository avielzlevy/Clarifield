import React, { useState, useEffect, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import {
  ChevronUp,
  ChevronDown,
  Boxes,
  Book,
  FileJson,
} from 'lucide-react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useSearch } from '../contexts/SearchContext';
import { useTranslation } from 'react-i18next';

export default function SearchAll({ setPage}) {
  const theme = useTheme();
  const { setSearch,refreshSearchables } = useSearch();
  const { t } = useTranslation();

  const [searchables, setSearchables] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState(null);
  const [forceOpen, setForceOpen] = useState(false);

  // Fetch searchables concurrently from multiple endpoints.
  const fetchSearchables = useCallback(async () => {
    try {
      const [entitiesRes, definitionsRes, formatsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/entities`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/formats`),
      ]);
      const entities = entitiesRes.data;
      const definitions = definitionsRes.data;
      const formats = formatsRes.data;

      const combinedSearchables = [
        ...Object.values(entities).map((entity) => ({
          type: 'Entity',
          name: entity.label,
        })),
        ...Object.keys(definitions).map((def) => ({
          type: 'Definition',
          name: def,
        })),
        ...Object.keys(formats).map((format) => ({
          type: 'Format',
          name: format,
        })),
      ];

      setSearchables(combinedSearchables);
    } catch (error) {
      console.error('Error fetching searchables:')
      console.debug(error)
    }
  }, []);

  useEffect(() => {
    fetchSearchables();
  }, [fetchSearchables, refreshSearchables]);

  // Handle selection from the autocomplete options.
  const handleSelection = useCallback(
    (event, newOption) => {
      if (!newOption) return;

      // Update search context.
      setSearch(newOption.name);

      // Switch page based on the option type.
      if (newOption.type === 'Entity') {
        const index = searchables.findIndex((s) => s.name === newOption.name);
        localStorage.setItem(
          'reactFlowCenter',
          JSON.stringify({ x: index * 150, y: -200, zoom: 2 })
        );
        setPage('entities');
      } else if (newOption.type === 'Definition') {
        setPage('definitions');
      } else if (newOption.type === 'Format') {
        setPage('formats');
      }

      // Clear input and close dropdown.
      setInputValue('');
      setValue(null);
      setForceOpen(false);
    },
    [searchables, setPage, setSearch]
  );

  // Map group names to icon components.
  const groupIconMap = {
    Entity: <Boxes style={{ fontSize: '1.5rem', ml: 1 }} />,
    Definition: <Book style={{ fontSize: '1.5rem', ml: 1 }} />,
    Format: <FileJson style={{ fontSize: '1.5rem', ml: 1 }} />,
  };

  return (
    <Autocomplete
      freeSolo
      options={searchables}
      groupBy={(option) => option.type}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.name || ''
      }
      
      sx={{ width: 500 }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      value={value}
      onChange={handleSelection}
      // Open the dropdown if the input is non-empty or forced open.
      open={forceOpen || Boolean(inputValue)}
      onClose={() => setForceOpen(false)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={t('search')}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ ml: 0.5, height: '10px', width: '15px' }}
                >
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <InputAdornment position="end">
                    <IconButton onClick={() => setForceOpen(!forceOpen)}>
                      {forceOpen ? <ChevronUp /> : <ChevronDown />}
                    </IconButton>
                  </InputAdornment>
                </>
              ),
              type: 'search',
              size: 'small',
              sx: { borderRadius: '20px', marginRight: '10px',height: '40px'},
            },
          }}
        />
      )}
      renderGroup={(params) => {
        const { key, ...rest } = params;
        return (
          <div key={key} {...rest}>
            <Box
              sx={{
                bgcolor: theme.palette.custom?.light || 'inherit',
                display: 'flex',
                padding: 1,
                alignItems: 'center',
              }}
            >
              {groupIconMap[params.group] || null}
              <Typography
                sx={{
                  padding: '1px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  ml: 1,
                }}
              >
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
