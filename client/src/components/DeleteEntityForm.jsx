import React, { useState } from 'react';
import { Box, Typography, FormControlLabel, Checkbox, Button } from '@mui/material';
import ChangeWarning from '../components/ChangeWarning';

function DeleteEntityForm({ selectedNode, affected, onDelete, onCancel }) {
  // If there are affected items, start with the confirmation unchecked.
  const [sure, setSure] = useState(affected ? false : true);

  const handleDelete = () => {
    if (sure) {
      onDelete(selectedNode);
    } else {
      // You might replace this with a snackbar or other user feedback
      console.error('Please confirm deletion by checking the box.');
    }
  };

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
      {/* Header with the title and warning */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" color="error">
          {`Delete ${selectedNode?.name}`}
        </Typography>
        {affected && <ChangeWarning items={affected} level="error" />}
      </Box>

      {/* Description */}
      <Typography variant="body1">
        Are you sure you want to delete the entity "{selectedNode?.name}"? This action cannot be undone.
      </Typography>

      {/* Confirmation Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={sure}
            onChange={() => setSure(!sure)}
          />
        }
        label="I confirm I want to delete this entity"
      />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete
        </Button>
      </Box>
    </Box>
  );
}

export default DeleteEntityForm;
