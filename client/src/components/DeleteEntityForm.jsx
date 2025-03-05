import React, { useCallback } from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';

const DeleteEntityForm = ({ node: { label }, sureDelete, setSureDelete }) => {
  const handleCheckboxChange = useCallback(() => {
    setSureDelete((prev) => !prev);
  }, [setSureDelete]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2,
        minWidth: 250,
      }}
    >
      <Typography variant="body1">
        Are you sure you want to delete the entity "{label}"? This action cannot be undone.
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={sureDelete}
            onChange={handleCheckboxChange}
            inputProps={{ 'aria-label': 'Confirm entity deletion' }}
          />
        }
        label="I confirm I want to delete this entity"
      />
    </Box>
  );
}

export default React.memo(DeleteEntityForm);
