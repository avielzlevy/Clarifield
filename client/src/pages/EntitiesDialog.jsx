import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import EditEntityForm from '../components/EditEntityForm';
import CopyEntityForm from '../components/CopyEntityForm';

function EntitiesDialog(props) {
    const { open, onClose, selectedNode,setSelectedNode, mode,nodes,setNodes } = props;
    console.log(selectedNode)

    const handleAction = () => {
        if (mode === 'edit') {
            // Edit the selected node
            const newNodes = [...nodes];
            const index = newNodes.findIndex((node) => node.id === selectedNode.id);
            newNodes[index] = selectedNode;
            setNodes(newNodes);
        } else {
            //copy the selected node
        }
        onClose();
    }

    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>{mode === 'edit' ? 'Edit' : 'Copy'} Entity</DialogTitle>
                <DialogContent>
                    {mode === 'edit' ? (
                        <EditEntityForm node={selectedNode} setNode={setSelectedNode}/>
                    ) : (
                        <CopyEntityForm node={selectedNode}/>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                    <Button onClick={handleAction} variant="contained" color="primary">
                        {mode === 'edit' ? 'Edit' : 'Copy'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default EntitiesDialog;
