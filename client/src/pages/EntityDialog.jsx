import React, { useCallback, useEffect, useState } from 'react';
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
import CreateEntityForm from '../components/CreateEntityForm';
import DeleteEntityForm from '../components/DeleteEntityForm';
import { sendAnalytics } from '../utils/analytics';

function EntityDialog(props) {
  const { open, onClose, selectedNode, setSelectedNode, mode, fetchNodes,setRefreshSearchables } = props;
  const [checkedFields, setCheckedFields] = useState([]);
  const [affectedItems, setAffectedItems] = useState(null);
  const [definitions, setDefinitions] = useState({});
  const [entities, setEntities] = useState({});
  const [newEntity, setNewEntity] = useState({ label: '', fields: [] });
  const [sureDelete, setSureDelete] = useState(false);
  const { logout } = useAuth();
  const token = localStorage.getItem('token');
  const fetchDefinitions = async () => {
    const definitionsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`);
    const definitions = definitionsResponse.data;
    setDefinitions(definitions);
  };
  const fetchEntities = async () => {
    const entitiesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
    const entities = entitiesResponse.data;
    setEntities(entities);
  };
  useEffect(() => {
    fetchDefinitions();
    fetchEntities();
  }, []);

  const getAffectedEntities = useCallback(async () => {
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
      if (e.response.status === 401) {
        logout({ mode: 'bad_token' });
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
      if (e.response.status === 401) {
        logout({ mode: 'bad_token' });
        return;
      }
      affectedEntities = {};
    }
    const affectedAll = { ...affectedDefinitions, ...affectedEntities };
    // console.log(`Affected all: ${JSON.stringify(affectedAll)}`);
    if (Object.keys(affectedAll).length === 0) {
      setAffectedItems(null);
      return;
    }
    setAffectedItems(affectedAll);
  }, [selectedNode, token, logout]);

  useEffect(() => {
    // console.log(`Selected node: ${JSON.stringify(selectedNode)}`);
    // console.log(`Mode: ${mode}`);
    if (selectedNode && mode === 'edit')
      getAffectedEntities();
  }, [selectedNode, mode, getAffectedEntities]);

  const handleAction = async () => {
    const formatsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats`);
    const formats = formatsResponse.data;
    if (mode === 'edit') {
      // Edit the selected node
      // console.log(`Editing node: ${JSON.stringify(selectedNode)}`);
      const responseEdit = await axios.put(`${process.env.REACT_APP_API_URL}/api/entity/${selectedNode.label}`, selectedNode, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (responseEdit.status === 200) {
        fetchNodes();
        enqueueSnackbar('Entity edited successfully!', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to edit entity!', { variant: 'error' });
      }
    } else if (mode === 'copy') {
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
          sendAnalytics(field.label, 'definition', 1);
        } else if (field.type === 'entity') {
          const entity = entities[field.label];
          let entityData = {};
          for (const entityField of entity.fields) {
            const item = {
              ...definitions[entityField.label],
              format: formats[definitions[entityField.label].format].pattern,
            }
            entityData[entityField.label] = item;
            sendAnalytics(entityField.label, 'definition', 1);
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
    } else if (mode === 'create') {
      // Create mode: Create a new entity
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/entities`, newEntity, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchNodes();
        enqueueSnackbar('Entity created successfully!', { variant: 'success' });
        setNewEntity({ label: '', fields: [] });
      } catch (e) {
        // console.log(e);
        if (e.response.status === 400) {
          enqueueSnackbar('Failed to create entity!', { variant: 'error' });
        } else if (e.response.status === 409) {
          enqueueSnackbar('Entity already exists!', { variant: 'error' });
        } else if (e.response.status === 401) {
          logout({ mode: 'bad_token' });
          onClose();
          return;
        } else {
          enqueueSnackbar('Failed to create entity!', { variant: 'error' });
        }
      }
    } else if (mode === 'delete') {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/entity/${selectedNode.label}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchNodes();
        enqueueSnackbar('Entity deleted successfully!', { variant: 'success' });
      } catch (e) {
        if (e.response.status === 401) {
          logout({ mode: 'bad_token' });
          onClose();
          return;
        } else {
          enqueueSnackbar('Failed to delete entity!', { variant: 'error' });
        }
      } finally {
        setSureDelete(false);
      }
    }
    setRefreshSearchables((prev) => prev+1);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{mode === 'edit' ? 'Edit' : mode === 'copy' ? 'Copy' : mode === 'create' ? 'Create' : mode === 'delete' ? 'Delete' : null} Entity
          {mode === 'edit' ? affectedItems && <ChangeWarning items={affectedItems} level='warning' /> : mode === 'delete' ? affectedItems && <ChangeWarning items={affectedItems} level='error' /> : null}
        </DialogTitle>
        <DialogContent>
          {mode === 'edit' ? (
            <EditEntityForm node={selectedNode} setNode={setSelectedNode} definitions={definitions} entities={entities} />
          ) : mode === 'copy' ? (
            <CopyEntityForm
              node={selectedNode}
              onCheckChange={setCheckedFields}
            />
          ) : mode === 'create' ? (
            <CreateEntityForm definitions={definitions} entities={entities} newEntity={newEntity} setNewEntity={setNewEntity} />
          ) : mode === 'delete' ? <DeleteEntityForm node={selectedNode} affected={affectedItems} sureDelete={sureDelete} setSureDelete={setSureDelete} onDelete={handleAction} onCancel={onClose} /> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color="primary"
            disabled={(mode === 'copy' && checkedFields.length === 0) || (mode === 'delete' && !sureDelete)}
          >
            {mode === 'edit' ? 'Edit' : mode === 'copy' ? 'Copy' : mode === 'create' ? 'Create' : mode === 'delete' ? 'Delete' : null}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EntityDialog;