import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ChangeWarning from '../components/ChangeWarning';
import { Checkbox,FormControlLabel } from '@mui/material';
import { enqueueSnackbar } from 'notistack';


function DeleteDialog({ open, onClose, deletedItem, onDelete, affected }) {
    const [sure, setSure] = useState(()=>{
        if(affected)
            return false;
        return true;
    });
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                Delete Confirmation
                {affected && <ChangeWarning items={affected} level={'error'} />}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete: {deletedItem?.name}? This action is permanent and cannot be reverted.
                </DialogContentText>
                {affected &&  <FormControlLabel sx={{mr:0.2}} control={<Checkbox checked={sure} onChange={() => setSure(!sure)} />} label="Are you sure?" labelPlacement='start'/>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={
                    () => {
                        if (sure)
                            onDelete(deletedItem)
                        else
                            enqueueSnackbar('Please confirm that you are sure', { variant: 'error' });
                    }
                } variant="contained"
                    color="error">Delete</Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteDialog;
