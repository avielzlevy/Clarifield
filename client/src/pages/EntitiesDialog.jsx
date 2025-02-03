import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import EditEntityForm from '../components/EditEntityForm';
import CopyEntityForm from '../components/CopyEntityForm';

function EntitiesDialog(props) {
  const { open, onClose, selectedNode, setSelectedNode, mode, nodes, setNodes } = props;
  const copyFormRef = useRef();

  const handleAction = async () => {
    if (mode === 'edit') {
      // Edit the selected node.
      const newNodes = [...nodes];
      const index = newNodes.findIndex((node) => node.id === selectedNode.id);
      newNodes[index] = selectedNode;
      setNodes(newNodes);
    } else {
      // In "copy" mode: retrieve the selected fields from CopyEntityForm and copy them to clipboard.
      if (copyFormRef.current) {
        const selectedFields = copyFormRef.current.getSelectedFields();
        try {
          await navigator.clipboard.writeText(JSON.stringify(selectedFields, null, 2));
          alert('Copied to clipboard!');
        } catch (err) {
          alert('Failed to copy to clipboard.');
        }
      }
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{mode === 'edit' ? 'Edit' : 'Copy'} Entity</DialogTitle>
      <DialogContent>
        {mode === 'edit' ? (
          <EditEntityForm node={selectedNode} setNode={setSelectedNode} />
        ) : (
          <CopyEntityForm ref={copyFormRef} node={selectedNode} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleAction} variant="contained" color="primary">
          {mode === 'edit' ? 'Edit' : 'Copy'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EntitiesDialog;
