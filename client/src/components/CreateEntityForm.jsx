import React, { useEffect,useMemo } from 'react';
import {
  Paper,
  TextField,
  Box,
  Autocomplete,
  IconButton,
  Button,
  Alert,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImportContactsOutlinedIcon from '@mui/icons-material/ImportContactsOutlined';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { useDefinitions } from '../contexts/useDefinitions';
import { useEntities } from '../contexts/useEntities';

const CreateEntityForm = ({newEntity, setNewEntity }) => {
  // Ensure there's at least one field on mount.
  useEffect(() => {
    if (!newEntity.fields || newEntity.fields.length === 0) {
      setNewEntity({ ...newEntity, fields: [{ label: '' }] });
    }
  }, [newEntity, setNewEntity]);

  // Build options from definitions and entities with group labels.
  const {definitions} = useDefinitions();
  const {entities} = useEntities();
  const options = useMemo(() => {
    const defOptions = Object.keys(definitions).map((key) => ({
      label: key,
      group: 'Definitions',
    }));
    const entityOptions = Object.keys(entities).map((key) => ({
      label: key,
      group: 'Entities',
    }));
    return [...entityOptions, ...defOptions];
  }, [definitions, entities]);

  // Map group names to icon components.
  const groupIconMap = {
    Definitions: <ImportContactsOutlinedIcon sx={{ fontSize: '1.2rem', mr: 0.5 }} />,
    Entities: <DataObjectIcon sx={{ fontSize: '1.2rem', mr: 0.5 }} />,
  };

  // Update a field's label and type based on the input.
  const handleFieldChange = (index, newValue) => {
    let label = '';
    let group = null;

    if (typeof newValue === 'object' && newValue !== null) {
      // When an option is selected from the list.
      label = newValue.label;
      group = newValue.group;
    } else if (typeof newValue === 'string') {
      // When freeSolo input is provided.
      label = newValue;
      if (definitions.hasOwnProperty(newValue)) {
        group = 'Definitions';
      } else if (entities.hasOwnProperty(newValue)) {
        group = 'Entities';
      }
    }

    const newFields = [...newEntity.fields];
    newFields[index] = {
      ...newFields[index],
      label,
      type:
        group === 'Definitions'
          ? 'definition'
          : group === 'Entities'
          ? 'entity'
          : 'unknown',
    };
    setNewEntity({ ...newEntity, fields: newFields });
  };

  // Add a new empty field.
  const addField = () => {
    setNewEntity({
      ...newEntity,
      fields: [...newEntity.fields, { label: '' }],
    });
  };

  // Remove a field at a given index.
  const removeField = (index) => {
    setNewEntity({
      ...newEntity,
      fields: newEntity.fields.filter((_, i) => i !== index),
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <TextField
        label="Entity Name"
        variant="outlined"
        fullWidth
        value={newEntity.label}
        onChange={(e) => setNewEntity({ ...newEntity, label: e.target.value })}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mt: 2,
          minWidth: 250,
        }}
      >
        {newEntity.fields.map((field, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              options={options}
              groupBy={(option) => option.group || ''}
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.label
              }
              value={field.label}
              onChange={(event, newValue) => handleFieldChange(index, newValue)}
              onInputChange={(event, newInputValue) =>
                handleFieldChange(index, newInputValue)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Field ${index + 1}`}
                  variant="outlined"
                  fullWidth
                />
              )}
              renderGroup={(params) => {
                const { key, group, children, ...rest } = params;
                return (
                  <div key={key} {...rest}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        bgcolor: 'action.hover',
                      }}
                    >
                      {groupIconMap[group] || null}
                      <Typography sx={{ fontWeight: 'bold', ml: 1 }}>
                        {group}
                      </Typography>
                    </Box>
                    {children}
                  </div>
                );
              }}
              sx={{ flex: 1 }}
            />
            {newEntity.fields.length > 1 && (
              <IconButton onClick={() => removeField(index)}>
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}

        <Button variant="outlined" startIcon={<AddIcon />} onClick={addField}>
          Add Field
        </Button>

        {newEntity.fields.length === 0 && (
          <Alert severity="warning">At least one field is required</Alert>
        )}
      </Box>
    </Paper>
  );
};

export default CreateEntityForm;
