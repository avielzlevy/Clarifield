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
import { useDefinitions } from '../contexts/useDefinitions';
import { useEntities } from '../contexts/useEntities';
import { useFormats } from '../contexts/useFormats';
import { useAffectedItems } from '../contexts/useAffectedItems';
import { generateSampleObject, determineRegexType } from '../utils/clipboardUtils';

function EntityDialog({
  open,
  onClose,
  selectedNode,
  setSelectedNode,
  mode,
  fetchNodes,
}) {
  const [checkedFields, setCheckedFields] = useState([]);
  const { affected, fetchAffectedItems } = useAffectedItems();
  const { definitions, fetchDefinitions } = useDefinitions();
  const { formats } = useFormats();
  const { entities, fetchEntities } = useEntities();
  const [newEntity, setNewEntity] = useState({ label: '', fields: [] });
  const [sureDelete, setSureDelete] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const { setRefreshSearchables } = useSearch();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDefinitions();
    fetchEntities();
  }, [fetchDefinitions, fetchEntities]);

  // Get affected items for a given node.


  useEffect(() => {
    if (selectedNode && (mode === 'edit' || mode === 'delete')) {
      fetchAffectedItems({ name: selectedNode.label, type: 'entity' });
    }
  }, [selectedNode, mode, fetchAffectedItems]);

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

  const handleCopyClick = async ({entity,selectedData, type}) => {
    console.log(selectedData, type);
    const data = selectedData.map((def) => {
      const formatPattern = formats[definitions[def.label].format]?.pattern || 'Pattern not found';
      const description = definitions[def.label].description || 'No description available';
      const regexType = determineRegexType(formatPattern);
      sendAnalytics(def.label, 'definition', 1)
      sendAnalytics(formatPattern, 'format', 1)
      return {
        name: def.label,
        type: regexType,
        format: formatPattern,
        description: description,
      };
    });
    if (!data || data.length === 0) {
      enqueueSnackbar('No data available to export.', { variant: 'warning' });
      return;
    }
    if (type === 'object') {
      const entityData = {
        [entity.label]: data.reduce((acc, curr) => {
          acc[curr.name] = {
            type: curr.type,
            format: curr.format,
            description: curr.description,
          };
          return acc;
        }, {}),
      }
      const clipBoardData = JSON.stringify(entityData, null, 2);
      //this needs to be string at the end
      const clipboardItem = new ClipboardItem({ 'text/plain': new Blob([clipBoardData], { type: 'text/plain' }) });
      await navigator.clipboard.write([clipboardItem]);
      enqueueSnackbar('Data copied to clipboard!', { variant: 'success' });
    }
    else if (type === 'table') {
      try {
        // Extract headers
        const headers = Object.keys(data[0]);

        // Start constructing the HTML table
        let htmlTable = `<h3>${entity.label}</h3><table border="1" cellspacing="0" cellpadding="5"><thead><tr>`;

        // Add table headers
        // // TODO: Add support for rtl
        headers.reverse().forEach(header => {
          htmlTable += `<th>${header}</th>`;
        });
        htmlTable += '</tr></thead><tbody>';

        // Add table rows
        data.forEach(row => {
          htmlTable += '<tr>';
          headers.forEach(header => {
            const cellData = row[header] !== null && row[header] !== undefined ? row[header] : '';
            htmlTable += `<td>${cellData}</td>`;
          });
          htmlTable += '</tr>';
        });
        htmlTable += '</tbody></table>';

        // Prepare clipboard items
        const blobHtml = new Blob([htmlTable], { type: 'text/html' });
        const blobText = new Blob([htmlTable.replace(/<\/?[^>]+(>|$)/g, "")], { type: 'text/plain' }); // Plain text fallback

        const clipboardItems = [
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ];

        // Write to clipboard
        await navigator.clipboard.write(clipboardItems);

        enqueueSnackbar('Table copied to clipboard!', { variant: 'success' });
      } catch (err) {
        console.error('Failed to copy: ', err);
        enqueueSnackbar('Failed to copy data to clipboard.', { variant: 'error' });
      }
    }
    else if (type === 'example') {
      const sampleData = generateSampleObject(data);
      const clipBoardData = JSON.stringify(sampleData, null, 2);
      const clipboardItem = new ClipboardItem({ 'text/plain': new Blob([clipBoardData], { type: 'text/plain' }) });
      await navigator.clipboard.write([clipboardItem]);
      enqueueSnackbar('Sample data copied to clipboard!', { variant: 'success' });
    }
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
          ? affected && <ChangeWarning items={affected} level="warning" />
          : mode === 'delete'
            ? affected && <ChangeWarning items={affected} level="error" />
            : null}
      </DialogTitle>
      <DialogContent>
        {mode === 'edit' ? (
          <EditEntityForm
            node={selectedNode}
            setNode={setSelectedNode}
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
            <Button variant="contained" color="primary" onClick={handleMenuOpen} disabled={checkedFields.length === 0}>
              Copy
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleCopyClick({entity: selectedNode, selectedData: checkedFields, type: 'table'})}>Copy as Table</MenuItem>
              <MenuItem onClick={() => handleCopyClick({entity: selectedNode, selectedData: checkedFields, type: 'object'})}>Copy as Object</MenuItem>
              <MenuItem onClick={() => handleCopyClick({entity: selectedNode, selectedData: checkedFields, type: 'example'})}>Copy as Example</MenuItem>
            </Menu>
          </Box>}
      </DialogActions>
    </Dialog>
  );
}

export default EntityDialog;
