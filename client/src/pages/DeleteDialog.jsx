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
import { useAffectedItems } from '../contexts/useAffectedItems';

const DeleteDialog = ({ open, onClose, deletedItem, onDelete, type }) => {
  const { affected, fetchAffectedItems } = useAffectedItems();
  // If there are affected items, require confirmation; otherwise default to true.
  const [sure, setSure] = useState(false);

  // Reset the confirmation state whenever the dialog opens or affected items change.
  useEffect(() => {
    if (open&&deletedItem)
      fetchAffectedItems({ name: deletedItem.name, type });
  }, [open,deletedItem, fetchAffectedItems, type]);
  useEffect(() => {
    if (!open) {
      setSure(false); // Reset when dialog closes
    }
  }, [open]);

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
        <Button onClick={() => onDelete(deletedItem)} variant="contained" color="error" disabled={affected && !sure}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
