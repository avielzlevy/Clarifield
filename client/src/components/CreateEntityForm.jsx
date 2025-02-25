import React, { useEffect, useMemo } from 'react';
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
import {
  Trash2 as Trash,
  Plus,
  Book,
  Boxes
} from 'lucide-react';
import { useDefinitions } from '../contexts/useDefinitions';
import { useEntities } from '../contexts/useEntities';
import { useTheme } from '@emotion/react';

const CreateEntityForm = ({ newEntity, setNewEntity,error }) => {
  const theme = useTheme();
  // Ensure there's at least one field on mount.
  useEffect(() => {
    if (!newEntity.fields || newEntity.fields.length === 0) {
      setNewEntity({ ...newEntity, fields: [{ label: '' }] });
    }
  }, [newEntity, setNewEntity]);

  // Build options from definitions and entities with group labels.
  const { definitions } = useDefinitions();
  const { entities } = useEntities();
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
    Definitions: <Book sx={{ fontSize: '1.2rem', mr: 0.5 }} />,
    Entities: <Boxes sx={{ fontSize: '1.2rem', mr: 0.5 }} />,
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
        helperText={error}
        error={Boolean(error)}
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
        {newEntity.fields.map((field, index) => {
          // Exclude options already selected in other fields.
          const selectedLabelsExceptCurrent = newEntity.fields
            .filter((_, i) => i !== index)
            .map((f) => f.label);
          const filteredOptions = options.filter(
            (option) => !selectedLabelsExceptCurrent.includes(option.label)
          );

          return (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Autocomplete
                freeSolo
                options={filteredOptions}
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
                // Render group headers with icons.
                renderGroup={(params) => {
                  const { key, group, children, ...rest } = params;
                  return (
                    <div key={key} {...rest}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          bgcolor: theme.palette.custom.light,
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
                  <Trash />
                </IconButton>
              )}
            </Box>
          );
        })}

        <Button variant="outlined" startIcon={<Plus />} onClick={addField}>
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
