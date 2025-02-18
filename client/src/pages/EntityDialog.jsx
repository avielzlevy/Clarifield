import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import EditEntityForm from '../components/EditEntityForm';
import CopyEntityForm from '../components/CopyEntityForm';
import CreateEntityForm from '../components/CreateEntityForm';
import DeleteEntityForm from '../components/DeleteEntityForm';
import ChangeWarning from '../components/ChangeWarning';
import { useAuth } from '../contexts/AuthContext';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';
import { sendAnalytics } from '../utils/analytics';
import { useSearch } from '../contexts/SearchContext';

function EntityDialog({
  open,
  onClose,
  selectedNode,
  setSelectedNode,
  mode,
  fetchNodes,
}) {
  const [checkedFields, setCheckedFields] = useState([]);
  const [affectedItems, setAffectedItems] = useState(null);
  const [definitions, setDefinitions] = useState({});
  const [entities, setEntities] = useState({});
  const [newEntity, setNewEntity] = useState({ label: '', fields: [] });
  const [sureDelete, setSureDelete] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const { setRefreshSearchables } = useSearch();
  const token = localStorage.getItem('token');

  // Fetch definitions from the API.
  const fetchDefinitions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`);
      setDefinitions(data);
    } catch (error) {
      console.error('Error fetching definitions:', error);
    }
  }, []);

  // Fetch entities from the API.
  const fetchEntities = useCallback(async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
      setEntities(data);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  }, []);

  useEffect(() => {
    fetchDefinitions();
    fetchEntities();
  }, [fetchDefinitions, fetchEntities]);

  // Get affected items for a given node.
  const getAffectedEntities = useCallback(async () => {
    if (!selectedNode) return;
    const source = selectedNode.label.toLowerCase();
    let affectedDefinitions = {};
    let affectedEntities = {};

    try {
      const resDef = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/affected?definition=${source}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resDef.status === 200) affectedDefinitions = resDef.data;
    } catch (e) {
      if (e.response?.status === 401) {
        logout({ mode: 'bad_token' });
        return;
      }
    }
    try {
      const resEnt = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/affected?entity=${source}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resEnt.status === 200) affectedEntities = resEnt.data;
    } catch (e) {
      if (e.response?.status === 401) {
        logout({ mode: 'bad_token' });
        return;
      }
    }

    const affectedAll = { ...affectedDefinitions, ...affectedEntities };
    setAffectedItems(Object.keys(affectedAll).length > 0 ? affectedAll : null);
  }, [selectedNode, token, logout]);

  useEffect(() => {
    if (selectedNode && (mode === 'edit' || mode === 'delete')) {
      getAffectedEntities();
    }
  }, [selectedNode, mode, getAffectedEntities]);

  // Handle the dialog action based on the current mode.
  const handleAction = useCallback(async () => {
    try {
      const { data: formats } = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats`);
      switch (mode) {
        case 'edit': {
          const res = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/entity/${selectedNode.label}`,
            selectedNode,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.status === 200) {
            fetchNodes();
            enqueueSnackbar('Entity edited successfully!', { variant: 'success' });
          } else {
            enqueueSnackbar('Failed to edit entity!', { variant: 'error' });
          }
          break;
        }
        case 'copy': {
          if (checkedFields.length === 0) return;
          let checkedFieldsData = {};
          for (const field of checkedFields) {
            if (field.type === 'definition') {
              const item = {
                ...definitions[field.label],
                format: formats[definitions[field.label].format].pattern,
              };
              checkedFieldsData[field.label] = item;
              sendAnalytics(field.label, 'definition', 1);
            } else if (field.type === 'entity') {
              const entity = entities[field.label];
              let entityData = {};
              for (const entityField of entity.fields) {
                const item = {
                  ...definitions[entityField.label],
                  format: formats[definitions[entityField.label].format].pattern,
                };
                entityData[entityField.label] = item;
                sendAnalytics(entityField.label, 'definition', 1);
              }
              checkedFieldsData[entity.label] = entityData;
            }
          }
          const copyObject = { [selectedNode.label]: checkedFieldsData };
          try {
            await navigator.clipboard.writeText(JSON.stringify(copyObject, null, 2));
            enqueueSnackbar('Copied to clipboard!', { variant: 'success' });
          } catch (err) {
            console.error('Failed to copy:', err);
          }
          break;
        }
        case 'create': {
          try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/entities`, newEntity, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchNodes();
            enqueueSnackbar('Entity created successfully!', { variant: 'success' });
            setNewEntity({ label: '', fields: [] });
          } catch (e) {
            if (e.response?.status === 400) {
              enqueueSnackbar('Failed to create entity!', { variant: 'error' });
            } else if (e.response?.status === 409) {
              enqueueSnackbar('Entity already exists!', { variant: 'error' });
            } else if (e.response?.status === 401) {
              logout({ mode: 'bad_token' });
              onClose();
              return;
            } else {
              enqueueSnackbar('Failed to create entity!', { variant: 'error' });
            }
          }
          break;
        }
        case 'delete': {
          try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/entity/${selectedNode.label}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchNodes();
            enqueueSnackbar('Entity deleted successfully!', { variant: 'success' });
          } catch (e) {
            if (e.response?.status === 401) {
              logout({ mode: 'bad_token' });
              onClose();
              return;
            } else {
              enqueueSnackbar('Failed to delete entity!', { variant: 'error' });
            }
          } finally {
            setSureDelete(false);
          }
          break;
        }
        default:
          break;
      }
      setRefreshSearchables((prev) => prev + 1);
    } catch (error) {
      console.error('Error in handleAction:', error);
      enqueueSnackbar('Action failed!', { variant: 'error' });
    } finally {
      onClose();
    }
  }, [
    mode,
    selectedNode,
    checkedFields,
    definitions,
    entities,
    fetchNodes,
    token,
    logout,
    setRefreshSearchables,
    onClose,
    newEntity,
  ]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  }

  const handleCopyClick = (type) => {
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {mode === 'edit'
          ? 'Edit'
          : mode === 'copy'
          ? 'Copy'
          : mode === 'create'
          ? 'Create'
          : mode === 'delete'
          ? 'Delete'
          : null}{' '}
        Entity
        {mode === 'edit'
          ? affectedItems && <ChangeWarning items={affectedItems} level="warning" />
          : mode === 'delete'
          ? affectedItems && <ChangeWarning items={affectedItems} level="error" />
          : null}
      </DialogTitle>
      <DialogContent>
        {mode === 'edit' ? (
          <EditEntityForm
            node={selectedNode}
            setNode={setSelectedNode}
            definitions={definitions}
            entities={entities}
          />
        ) : mode === 'copy' ? (
          <CopyEntityForm node={selectedNode} onCheckChange={setCheckedFields} />
        ) : mode === 'create' ? (
          <CreateEntityForm
            definitions={definitions}
            entities={entities}
            newEntity={newEntity}
            setNewEntity={setNewEntity}
          />
        ) : mode === 'delete' ? (
          <DeleteEntityForm
            node={selectedNode}
            sureDelete={sureDelete}
            setSureDelete={setSureDelete}
            onDelete={handleAction}
            onCancel={onClose}
            setSelectedNode={setSelectedNode}
          />
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {mode !== 'copy' ? <Button
          onClick={handleAction}
          variant="contained"
          color="primary"
          disabled={
            (mode === 'copy' && checkedFields.length === 0) ||
            (mode === 'delete' && !sureDelete)
          }
        >
          {mode === 'edit'
            ? 'Save'
            : mode === 'create'
            ? 'Create'
            : mode === 'delete'
            ? 'Delete'
            : null}
        </Button> : 
         <Box>
         <Button variant="contained" color="primary" onClick={handleMenuOpen}>
           Copy
         </Button>
         <Menu
           anchorEl={anchorEl}
           open={menuOpen}
           onClose={handleMenuClose}
           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
           transformOrigin={{ vertical: 'top', horizontal: 'right' }}
         >
           <MenuItem onClick={() => handleCopyClick('table')}>Copy as Table</MenuItem>
           <MenuItem onClick={() => handleCopyClick('object')}>Copy as Object</MenuItem>
           <MenuItem onClick={() => handleCopyClick('example')}>Copy as Example</MenuItem>
         </Menu>
       </Box>}
      </DialogActions>
    </Dialog>
  );
}

export default EntityDialog;
