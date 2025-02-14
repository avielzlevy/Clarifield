// import * as React from 'react';
// import TextField from '@mui/material/TextField';
// import Autocomplete from '@mui/material/Autocomplete';
// import InputAdornment from '@mui/material/InputAdornment';
// import SearchIcon from '@mui/icons-material/Search';
// import Typography from '@mui/material/Typography';
// import Box from '@mui/material/Box';
// import { useTheme } from '@mui/material/styles';
// import axios from 'axios';
// import { useSearch } from '../contexts/SearchContext';

// export default function SearchAll(props) {
//     const { setPage, page } = props;
//     const theme = useTheme();
//     const [searchables, setSearchables] = React.useState([]);
//     const [inputValue, setInputValue] = React.useState('');
//     const [searchTerm, setSearchTerm] = React.useState('');
//     const { search, setSearch } = useSearch();

//     React.useEffect(() => {
//         //position: { x: index * 150, y: 100 }
//         // console.log('Search term:', search);
//         switch (search?.type) {
//             case 'Entity':
//                 console.log(`${(searchables.findIndex((searchable) => searchable.name === search.name) + 1) * 150}`);
//                 localStorage.setItem('reactFlowCenter', JSON.stringify({ x: (searchables.findIndex((searchable) => searchable.name === search.name)) * 150, y: -200, zoom: 2 }));
//                 setPage('entities');
//                 break;
//             case 'Definition':
//                 setSearch(search.name);
//                 setPage('definitions');
//                 break;
//             case 'Format':
//                 setSearch(search.name);
//                 setPage('formats');
//                 break;
//             default:
//                 break;
//         }
//         return () => {
//             searchTerm && setSearchTerm('');
//             setInputValue('');
//         }
//     }, [searchTerm]);
//     React.useEffect(() => {
//         const fetchSearchables = async () => {
//             try {
//                 const responseEntities = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
//                 const entities = responseEntities.data;
//                 const responseDefinitions = await axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`);
//                 const definitions = responseDefinitions.data;
//                 const responseFormats = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats`);
//                 const formats = responseFormats.data;
//                 const searchables = [
//                     ...Object.keys(entities).map((entity) => ({ type: 'Entity', name: entities[entity].label })),
//                     ...Object.keys(definitions).map((definition) => ({ type: 'Definition', name: definition })),
//                     ...Object.keys(formats).map((format) => ({ type: 'Format', name: format })),
//                 ];
//                 setSearchables(searchables);
//             } catch (error) {
//                 console.error('Error fetching searchables:', error);
//             }
//         };

//         fetchSearchables();
//     }, []); // Added dependency array so this runs only once

//     return (
//         <Autocomplete
//             freeSolo
//             options={searchables}
//             groupBy={(option) => option.type}
//             getOptionLabel={(option) => typeof option === 'string' ? option : option.name || ''}
//             sx={{ width: 500 }}
//             // Bind inputValue state and update it on change
//             inputValue={inputValue}
//             onInputChange={(event, newInputValue) => {
//                 setInputValue(newInputValue);
//             }}
//             value={searchTerm}
//             onChange={(event, newValue) => {
//                 setSearchTerm(newValue);
//             }}
//             // Only open the dropdown if there's a search term
//             open={Boolean(inputValue)}
//             renderInput={(params) => (
//                 <TextField
//                     {...params}
//                     placeholder="Search..."
//                     slotProps={{
//                         input: {
//                             ...params.InputProps,
//                             startAdornment: (
//                                 <InputAdornment position="start" sx={{ ml: 0.5, height: '10px', width: '15px' }}>
//                                     <SearchIcon />
//                                 </InputAdornment>
//                             ),
//                             type: 'search',
//                             size: 'small',
//                             sx: {
//                                 borderRadius: '20px',
//                                 marginRight: '10px',
//                             },
//                         },
//                     }}
//                 />
//             )}
//             renderGroup={(params) => {
//                 const { key, ...rest } = params;
//                 return (
//                     <div key={key} {...rest}>
//                         <Box sx={{ bgcolor: theme.palette.custom.light }}>
//                             <Typography sx={{ padding: '1px', fontWeight: 'bold', fontSize: '1rem', ml: 1 }}>
//                                 {params.group}
//                             </Typography>
//                         </Box>
//                         {params.children}
//                     </div>
//                 )
//             }}

//         />
//     );
// }


import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useSearch } from '../contexts/SearchContext';
import { useTranslation } from 'react-i18next';

export default function SearchAll({ setPage }) {
  const theme = useTheme();
  const [searchables, setSearchables] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState(null);
  const { setSearch } = useSearch();
  const { t } = useTranslation();


  useEffect(() => {
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

    fetchSearchables();
  }, []);

  const handleSelection = (event, newOption) => {
    if (!newOption) return;

    // Update the search context so other components can use it
    setSearch(newOption.name);

    // Switch to the correct page based on the type
    if (newOption.type === 'Entity') {
      // Find index for centering (if needed) and save in localStorage
      const index = searchables.findIndex(s => s.name === newOption.name);
      localStorage.setItem('reactFlowCenter', JSON.stringify({ x: index * 150, y: -200, zoom: 2 }));
      setPage('entities');
    } else if (newOption.type === 'Definition') {
      setPage('definitions');
    } else if (newOption.type === 'Format') {
      setPage('formats');
    }

    // Clear both the input text and the selected value
    setInputValue('');
    setValue(null);
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
      open={Boolean(inputValue)}
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
            <Box sx={{ bgcolor: theme.palette.custom.light }}>
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
