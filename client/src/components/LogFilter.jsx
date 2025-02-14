import React, { useState, useMemo } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

// Component for timestamp filtering using a range (Before and After)
function TimestampFilter({ options, onFilterChange }) {
  const [beforeValue, setBeforeValue] = useState(null);
  const [afterValue, setAfterValue] = useState(null);

  const oldestTimestamp = () => {
    if (options.length === 0) return dayjs(new Date('2021-01-01'));
    // Assumes options are ISO strings; adjust if needed.
    return dayjs(new Date(options[0].split('T')[0]));
  };

  const newestTimestamp = () => {
    if (options.length === 0) return dayjs();
    return dayjs(new Date(options[options.length - 1].split('T')[0]));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <DateTimePicker
        label="After"
        value={afterValue}
        size="small"
        minDate={oldestTimestamp()}
        maxDate={newestTimestamp()}
        onChange={(newValue) => {
          setAfterValue(newValue);
          onFilterChange(newValue, 'after');
        }}
        sx={{ width: '10vw' }}
        slotProps={{
          textField: {
            inputProps: {
              readOnly: true,
              size: 'small',
            },
          },
        }}
      />
      <DateTimePicker
        label="Before"
        value={beforeValue}
        minDate={oldestTimestamp()}
        maxDate={newestTimestamp()}
        onChange={(newValue) => {
          setBeforeValue(newValue);
          onFilterChange(newValue, 'before');
        }}
        sx={{ width: '10vw' }}
        slotProps={{
          textField: {
            inputProps: {
              readOnly: true,
              size: 'small',
            },
          },
        }}
      />
    </Box>
  );
}

// Component for filtering non-timestamp fields using Autocomplete
function AutocompleteFilter({ options, label, onFilterChange }) {
  const [value, setValue] = useState(null);

  const handleAutocompleteChange = (event, newValue) => {
    setValue(newValue);
    onFilterChange(newValue);
  };

  return (
    <Autocomplete
      size="small"
      disablePortal
      options={options}
      value={value}
      onChange={handleAutocompleteChange}
      renderInput={(params) => <TextField {...params} label={label}       sx={{
        width:'10vw',
      }} />}
    />
  );
}

// Main LogFilter component
function LogFilter({ logs, label, onFilterChange }) {
  const options = useMemo(() => Array.from(new Set(logs)), [logs]);

  if (label.toLowerCase() === 'timestamp') {
    return <TimestampFilter options={options} onFilterChange={onFilterChange} />;
  }
  return <AutocompleteFilter options={options} label={label} onFilterChange={onFilterChange} />;
}

export default LogFilter;
