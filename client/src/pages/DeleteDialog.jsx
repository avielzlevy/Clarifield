import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
} from '@mui/material';
import ChangeWarning from '../components/ChangeWarning';
import { enqueueSnackbar } from 'notistack';
import { useAffectedItems } from '../contexts/useAffectedItems';

const DeleteDialog = ({ open, onClose, deletedItem, onDelete,type }) => {
  const { affected, fetchAffectedItems } = useAffectedItems();
  // If there are affected items, require confirmation; otherwise default to true.
  const [sure, setSure] = useState(affected);

  // Reset the confirmation state whenever the dialog opens or affected items change.
  useEffect(() => {
    if (deletedItem)
      fetchAffectedItems({ name: deletedItem.name, type });
  }, [deletedItem, fetchAffectedItems,type]);

  const handleDelete = () => {
    if (sure||!affected) {
      onDelete(deletedItem);
    } else {
      enqueueSnackbar('Please confirm that you are sure', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Delete Confirmation
        {affected && <ChangeWarning items={affected} level="error" />}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete: {deletedItem?.name}? This action is permanent and cannot be reverted.
        </DialogContentText>
        {affected && (
          <FormControlLabel
            sx={{ mr: 0.2 }}
            control={
              <Checkbox
                checked={sure}
                onChange={() => setSure((prev) => !prev)}
              />
            }
            label="Are you sure?"
            labelPlacement="start"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
