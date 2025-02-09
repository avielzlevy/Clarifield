import React from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import ChangeWarning from '../components/ChangeWarning';

function DeleteEntityForm({ node, affected,sureDelete,setSureDelete}) {
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
      {/* Description */}
      <Typography variant="body1">
        Are you sure you want to delete the entity "{node.label}"? This action cannot be undone.
      </Typography>

      {/* Confirmation Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={sureDelete}
            onChange={() => setSureDelete(!sureDelete)}
          />
        }
        label="I confirm I want to delete this entity"
      />
    </Box>
  );
}

export default DeleteEntityForm;
