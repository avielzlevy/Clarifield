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
import EditEntityForm from './EditEntityForm';
import CopyEntityForm from './CopyEntityForm';
import CreateEntityForm from './CreateEntityForm';
import DeleteEntityForm from './DeleteEntityForm';
import ReportEntityForm from './ReportEntityForm';
import ChangeWarning from './ChangeWarning';
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [newEntity, setNewEntity] = useState({ label: '', fields: [] });
  const [sureDelete, setSureDelete] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [error, setError] = useState(null);
  const [report, setReport] = useState({ type: '', description: '' });
  const { logout } = useAuth();
  const { setRefreshSearchables } = useSearch();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDefinitions();
    fetchEntities();
  }, [fetchDefinitions, fetchEntities]);

  // Get affected items for a given node.


  useEffect(() => {
    if (selectedNode && ['edit', 'delete'].includes(mode)) {
      fetchAffectedItems({ name: selectedNode.label, type: 'entity' });
    }
  }, [selectedNode, mode, fetchAffectedItems]);
  const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  // Handle the dialog action based on the current mode.
  const handleAction = useCallback(async () => {
    try {
      let response;
      const headers = { Authorization: `Bearer ${token}` };

      switch (mode) {
        case 'edit':
          response = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/entity/${selectedNode.label}`,
            selectedNode,
            { headers }
          );
          break;

        case 'create':
          if (/[A-Z]/.test(newEntity.label)) {
            setError(t('entity_name_lowercase_error'));
            throw new Error('Entity name must be lowercase');
          }
          response = await axios.post(`${process.env.REACT_APP_API_URL}/api/entities`, newEntity, { headers });
          break;

        case 'delete':
          response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/entity/${selectedNode.label}`, { headers });
          setSureDelete(false);
          break;

        case 'report':
          response = await axios.post(`${process.env.REACT_APP_API_URL}/api/report/${selectedNode.label}`, report, { headers });
          break;

        default:
          return;
      }

      if (response?.status >= 200 && response?.status < 300) {
        enqueueSnackbar(`${mode.charAt(0).toUpperCase() + mode.slice(1)} successful!`, { variant: 'success' });
        await fetchEntities();
        fetchNodes();
        setNewEntity({ label: '', fields: [] });
      }

      setRefreshSearchables((prev) => prev + 1);
      onClose();
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: 'bad_token' });
        onClose();
        return;
      } else if (error.response?.status === 409) {
        enqueueSnackbar(t('entity_already_exists'), { variant: 'error' });
      } else {
        console.error(`Error ${mode}ing entity:`, error);
        enqueueSnackbar(`${t('common.error')} ${t(`common.${mode}ing`)} ${t('entities.entity')}`, { variant: 'error' });
      }
    }
  }, [mode, selectedNode, fetchNodes, token, logout, setRefreshSearchables, onClose, newEntity, fetchEntities, report, t]);

  function processField(field) {
    // For a field from definitions:
    if (field.type === 'definition') {
      const def = definitions[field.label];
      if (!def) {
        console.error(`Definition for ${field.label} not found`);
        return null;
      }
      const formatPattern = formats[def.format]?.pattern || 'Pattern not found';
      const description = def.description || 'No description available';
      const regexType = determineRegexType(formatPattern);
      // (Analytics can be sent here if desired)
      sendAnalytics(field.label, 'definition', 1);
      sendAnalytics(formatPattern, 'format', 1);
      return {
        name: field.label,
        type: regexType,
        format: formatPattern,
        description: description,
      };
    }
    // For a field that is an entity:
    else if (field.type === 'entity') {
      const entity = entities[field.label];
      if (!entity) {
        console.error(`Entity ${field.label} not found`);
        return { name: field.label, type: 'entity', fields: [] };
      }
      sendAnalytics(field.label, 'entity', 1);
      // Process the nested fields recursively:
      const nestedFields = entity.fields
        .map(processField)
        .filter((item) => item !== null); // remove any errors
      return {
        name: field.label,
        type: 'entity',
        fields: nestedFields,
      };
    }
    // In case you have other types:
    else {
      console.error(`Unknown field type for ${field.label}`);
      return null;
    }
  }

  // Helper: Generates an HTML table for an array of processed fields.
  // Assumes every field in data has a similar shape.
  function generateHtmlTable(entityLabel, data) {
    if (!data || data.length === 0) return '';

    // Determine headers dynamically from the first row
    const headers = ['name', 'type', 'format', 'description'];

    // Use inline CSS for a modern table style
    let html = `
    <h3 style="font-family: Arial, sans-serif; color: #333;">${entityLabel}</h3>
    <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; color: #333;">
      <thead>
        <tr>
  `;

    // Reverse headers order if desired (or keep as is)
    headers.slice().reverse().forEach((header) => {
      html += `<th style="border: 1px solid #ccc; padding: 8px; background-color: #f2f2f2; text-align: right;">${header}</th>`;
    });

    html += `
        </tr>
      </thead>
      <tbody>
  `;

    data.forEach((row, rowIndex) => {
      // Optional: add alternating row colors for readability
      const rowStyle = rowIndex % 2 === 0 ? 'background-color: #fff;' : 'background-color: #fafafa;';
      html += `<tr style="${rowStyle}">`;

      headers.slice().reverse().forEach((header) => {
        let cellData = row[header];

        if (Array.isArray(cellData)) {
          // For arrays, join the string representations of each field.
          cellData = cellData
            .map((field) => {
              if (field.type === 'entity') {
                // Mark nested entity with its name; its full table will be appended later.
                return `[Entity: ${field.name}]`;
              } else {
                return `${field.name}: ${field.format || ''}`;
              }
            })
            .join(', ');
        } else if (typeof cellData === 'object' && cellData !== null) {
          // For definition objects
          cellData = `${cellData.type}: ${cellData.format || ''}`;
        }

        cellData = (cellData !== null && cellData !== undefined)
          ? (cellData === 'entity' ? 'object' : cellData)
          : '';

        html += `<td style="border: 1px solid #ccc; padding: 8px;">${cellData}</td>`;
      });

      html += '</tr>';
    });

    html += `
      </tbody>
    </table>
  `;

    return html;
  }


  // Helper: Recursively generate tables for any entity fields found
  function generateNestedEntityTables(data) {
    let nestedTablesHtml = '';

    data.forEach((field) => {
      if (field.type === 'entity' && field.fields && field.fields.length > 0) {
        // Generate table for the nested entity.
        nestedTablesHtml += generateHtmlTable(field.name, field.fields);
        // Recursively check for deeper nested entities
        nestedTablesHtml += generateNestedEntityTables(field.fields);
      }
    });

    return nestedTablesHtml;
  }

  function convertFieldsToObject(fields) {
    return fields.reduce((acc, field) => {
      if (field.type === 'entity') {
        // For entity fields, recursively convert their nested fields
        acc[field.name] = convertFieldsToObject(field.fields);
      } else {
        // For definition fields, assign the object as is.
        acc[field.name] = {
          type: field.type,
          format: field.format,
          description: field.description,
        };
      }
      return acc;
    }, {});
  }

  const handleCopyClick = async ({ entity, selectedData, type }) => {
    // Process the selected fields. Each field might be a definition or an entity.
    console.log('data', entity, selectedData, type);
    sendAnalytics(entity.label, 'entity', 1);
    const data = selectedData
      .map(processField)
      .filter((item) => item !== null);

    if (!data || data.length === 0) {
      enqueueSnackbar('No data available to export.', { variant: 'warning' });
      return;
    }

    if (type === 'object') {
      // ... (existing code unchanged for object type)
      const entityData = convertFieldsToObject(data);

      const clipBoardData = JSON.stringify(entityData, null, 2);
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([clipBoardData], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([clipboardItem]);
      enqueueSnackbar('Data copied to clipboard!', { variant: 'success' });
    } else if (type === 'table') {
      try {
        // Generate main table HTML for the top-level entity
        let htmlTable = generateHtmlTable(entity.label, data);
        // Now, for any entity fields, append their own tables below.
        htmlTable += generateNestedEntityTables(data);

        const blobHtml = new Blob([htmlTable], { type: 'text/html' });
        // Also create a plain text version by stripping HTML tags
        const blobText = new Blob([htmlTable.replace(/<\/?[^>]+(>|$)/g, '')], { type: 'text/plain' });

        const clipboardItems = [
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ];

        await navigator.clipboard.write(clipboardItems);
        enqueueSnackbar('Table copied to clipboard!', { variant: 'success' });
      } catch (err) {
        console.error('Failed to copy: ', err);
        enqueueSnackbar('Failed to copy data to clipboard.', { variant: 'error' });
      }
    } else if (type === 'example') {
      const sampleData = generateSampleObject(data);
      const clipboardRawData = {
        [entity.label]: sampleData,
      };
      const clipBoardData = JSON.stringify(clipboardRawData, null, 2);
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([clipBoardData], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([clipboardItem]);
      enqueueSnackbar('Sample data copied to clipboard!', { variant: 'success' });
    }
  };


  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {mode && t(`common.${mode}ing`)} {selectedNode?.label}
        {affected && ['edit', 'delete'].includes(mode) && (
          <ChangeWarning items={affected} level={mode === 'edit' ? 'warning' : 'error'} />
        )}
      </DialogTitle>
      <DialogContent>
        {mode === 'edit' && <EditEntityForm node={selectedNode} setNode={setSelectedNode} />}
        {mode === 'copy' && <CopyEntityForm node={selectedNode} onCheckChange={setCheckedFields} />}
        {mode === 'create' && <CreateEntityForm newEntity={newEntity} setNewEntity={setNewEntity} error={error} />}
        {mode === 'delete' && (
          <DeleteEntityForm
            node={selectedNode}
            sureDelete={sureDelete}
            setSureDelete={setSureDelete}
            onDelete={handleAction}
            onCancel={onClose}
          />
        )}
        {mode === 'report' && <ReportEntityForm node={selectedNode} report={report} setReport={setReport} />}
      </DialogContent>
      <DialogActions>
        <Button
          sx={{
            textTransform: 'capitalize',
          }}
          onClick={onClose}>{t('common.cancel')}</Button>
        {mode !== 'copy' ? <Button
          onClick={handleAction}
          variant="contained"
          color="primary"
          sx={{
            textTransform: 'capitalize',
          }}
          disabled={
            (mode === 'create' && (!newEntity.label || newEntity.fields.some((f) => !f.label))) ||
            (mode === 'edit' && selectedNode.fields.some((f) => !f.label)) ||
            (mode === 'delete' && !sureDelete)
          }
        >
          {t(`common.${mode}`)}
        </Button> :
          <Box>
            <Button variant="contained" color="primary" onClick={handleMenuOpen} disabled={checkedFields.length === 0} sx={{
              textTransform: 'capitalize',
            }}>
              {t('common.copy')}
            </Button>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
              {['table', 'object', 'example'].map((type) => (
                <MenuItem key={type} onClick={() => handleCopyClick({ entity: selectedNode, selectedData: checkedFields, type })}>
                  {t('common.copy_as')} {t(`common.${type}`)}
                  </MenuItem>
              ))}
            </Menu>
          </Box>}
      </DialogActions>
    </Dialog>
  );
}

export default EntityDialog;
