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
import { useAuth } from '../contexts/AuthContext';

function EntityDialog(props) {
  const { open, onClose, selectedNode, setSelectedNode, mode, nodes, setNodes } = props;
  const [checkedFields, setCheckedFields] = useState([]);
  const [affectedItems, setAffectedItems] = useState(null);
  const [definitions, setDefinitions] = useState({});
  const { logout } = useAuth();
  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchDefinitions = async () => {
      const definitionsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`);
      const definitions = definitionsResponse.data;
      setDefinitions(definitions);
    };
    fetchDefinitions();
  }, []);

  const getAffectedEntities = async () => {
    let affectedDefinitions, affectedEntities;
    const source = selectedNode.label.toLowerCase()
    try {
      const affectedDefinitionsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/affected?definition=${source}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      affectedDefinitions = affectedDefinitionsResponse.status === 200 ? affectedDefinitionsResponse.data : {};
    } catch (e) {
      if(e.response.status === 401) {
        logout();
        return;
      }
      affectedDefinitions = {};
    }
    try {
      const affectedEntitiesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/affected?entity=${source}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      affectedEntities = affectedEntitiesResponse.status === 200 ? affectedEntitiesResponse.data : {};
    } catch (e) {
      if(e.response.status === 401) {
        logout();
        return;
      }
      affectedEntities = {};
    }
    const affectedAll = { ...affectedDefinitions, ...affectedEntities };
    if (Object.keys(affectedAll).length === 0) {
      setAffectedItems(null);
      return;
    }
    setAffectedItems(affectedAll);
  }

  useEffect(() => {
    if (selectedNode&&mode==='edit')
      getAffectedEntities();
  }, [selectedNode, mode]);

  const handleAction = async () => {
    const formatsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats`);
    const formats = formatsResponse.data;
    const entitiesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
    const entities = entitiesResponse.data;
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
        <DialogTitle>{mode === 'edit' ? 'Edit' : 'Copy'} Entity {mode === 'edit' && <ChangeWarning items={affectedItems} level='warning' />}</DialogTitle>
        <DialogContent>
          {mode === 'edit' ? (
            <EditEntityForm node={selectedNode} setNode={setSelectedNode} definitions={definitions} />
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

export default EntityDialog;