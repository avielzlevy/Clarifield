import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import EditEntityForm from '../components/EditEntityForm';
import CopyEntityForm from '../components/CopyEntityForm';
import { enqueueSnackbar } from 'notistack'
import axios from 'axios';
import ChangeWarning from '../components/ChangeWarning';

function EntitiesDialog(props) {
  const { open, onClose, selectedNode, setSelectedNode, mode, nodes, setNodes } = props;
  const [checkedFields, setCheckedFields] = useState([]);
  const [affectedEntities, setAffectedEntities] = useState([]);
  const [definitions, setDefinitions] = useState({});
  const [formats, setFormats] = useState({});
  const [entities, setEntities] = useState({});
  const getAffectedEntities = () => {
    const source = selectedNode.label.toLowerCase()
    console.log(`entities: ${JSON.stringify(entities)}`);
    const entitiesNames = Object.keys(entities);
    const affectedEntities = entitiesNames.filter(entity => {
      const fields = entities[entity].fields;
      for (const field of fields) {
        if (field.type === 'entity' && field.label.toLowerCase() === source) {
          return true;
        }
      }
      return false;
    });
    setAffectedEntities(affectedEntities);
  }
  useEffect(() => {
    const fetchData = async () => {
      const definitionsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`);
      setDefinitions(definitionsResponse.data);
      const formatsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats`);
      setFormats(formatsResponse.data);
      const entitiesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
      setEntities(entitiesResponse.data);
    }
    fetchData();
  }, []);
  useEffect(() => {
    if (selectedNode)
      getAffectedEntities();
  }, [selectedNode]);
  const handleAction = async () => {

    if (mode === 'edit') {
      // Edit the selected node
      const newNodes = [...nodes];
      const index = newNodes.findIndex((node) => node.id === selectedNode.id);
      newNodes[index] = selectedNode;
      setNodes(newNodes);
    } else {
      // Copy mode: Create an object with only the checked fields
      if (checkedFields.length === 0) {
        return; // Don't copy if nothing is selected
      }
      let checkedFieldsData = {};
      for (const field of checkedFields) {
        // console.log(`checking field ${JSON.stringify(field)}`);
        if (field.type === 'definition') {
          const item = {
            ...definitions[field.label],
            format: formats[definitions[field.label].format].pattern,
          }
          checkedFieldsData[field.label] = item;
        } else if (field.type === 'entity') {
          const entity = entities[field.label];
          let entityData = {};
          for (const entityField of entity.fields) {
            const item = {
              ...definitions[entityField.label],
              format: formats[definitions[entityField.label].format].pattern,
            }
            entityData[entityField.label] = item;
          }
          checkedFieldsData[entity.label] = entityData;
        }
      }
      const copyObject = {
        [selectedNode.label]: checkedFieldsData,
      };

      try {
        await navigator.clipboard.writeText(JSON.stringify(copyObject, null, 2));
        enqueueSnackbar('Copied to clipboard!', { variant: 'success' });
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{mode === 'edit' ? 'Edit' : 'Copy'} Entity {mode === 'edit' && <ChangeWarning items={affectedEntities} level='warning' />}</DialogTitle>
        <DialogContent>
          {mode === 'edit' ? (
            <EditEntityForm node={selectedNode} setNode={setSelectedNode} />
          ) : (
            <CopyEntityForm
              node={selectedNode}
              onCheckChange={setCheckedFields}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color="primary"
            disabled={mode === 'copy' && checkedFields.length === 0}
          >
            {mode === 'edit' ? 'Edit' : 'Copy'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EntitiesDialog;