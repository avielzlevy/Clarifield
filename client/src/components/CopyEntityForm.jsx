import React, { useEffect, useState } from 'react';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import DataObjectIcon from '@mui/icons-material/DataObject';

function CopyEntityForm({ node, onCheckChange }) {
  const [checked, setChecked] = useState([]);

  const handleCheckboxChange = (field) => {
    setChecked((prev) => {
      if (prev.find(item => item.label === field.label)) {
        const newChecked = prev.filter(item => item.label !== field.label);
        onCheckChange(newChecked);
        return newChecked;
      }
      const newChecked = [...prev, field];
      onCheckChange(newChecked);
      return newChecked;
    });
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {node && node.fields.map((field, index) => (
        <FormControlLabel
          key={index}
          control={
            <Checkbox
              checked={checked.some(item => item.label === field.label)}
              onChange={() => handleCheckboxChange(field)}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography>{field.label}</Typography>
              {field.type === 'entity' && (
                <DataObjectIcon
                  sx={{
                    height: 16,
                    width: 16,
                    color: 'primary.main',
                    ml: 0.5
                  }}
                />
              )}
            </Box>
          }
        />
      ))}
    </Box>
  );
}

export default CopyEntityForm;