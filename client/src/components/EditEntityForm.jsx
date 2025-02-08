import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  IconButton,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function EditEntityForm(props) {
  const { node, setNode, definitions, entities } = props;

  // Build grouped options from definitions and entities.
  const defOptions = Object.keys(definitions).map((key) => ({
    label: key,
    group: 'Definitions',
  }));
  const entityOptions = Object.keys(entities).map((key) => ({
    label: key,
    group: 'Entities',
  }));
  const options = [...defOptions, ...entityOptions];

  // Update a field's value and its type based on whether it comes from definitions or entities.
  const handleFieldChange = (index, newValue) => {
    let label = '';
    let group = null;

    if (typeof newValue === 'object' && newValue !== null) {
      // newValue is one of our grouped option objects.
      label = newValue.label;
      group = newValue.group;
    } else if (typeof newValue === 'string') {
      // newValue is a freeSolo string.
      label = newValue;
      if (definitions && definitions.hasOwnProperty(newValue)) {
        group = 'Definitions';
      } else if (entities && entities.hasOwnProperty(newValue)) {
        group = 'Entities';
      }
    }

    if (!group) {
      console.log(`${label} is not a valid group`);
    }

    const newFields = [...node.fields];
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
    setNode({ ...node, fields: newFields });
  };

  // Adds an empty field.
  const addField = () => {
    setNode({ ...node, fields: [...node.fields, { label: '' }] });
  };

  // Removes a field at a given index.
  const removeField = (index) => {
    const newFields = node.fields.filter((_, i) => i !== index);
    setNode({ ...node, fields: newFields });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2,
        minWidth: 250,
      }}
    >
      {node &&
        node.fields.map((field, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Autocomplete
              freeSolo
              options={options}
              // Group options by their 'group' property.
              groupBy={(option) => (option.group ? option.group : '')}
              // If the option is a string, use it directly; otherwise use its label.
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.label
              }
              value={field.label}
              onChange={(event, newValue) =>
                handleFieldChange(index, newValue)
              }
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
              sx={{ flex: 1 }}
            />
            {node.fields.length > 1 && (
              <IconButton onClick={() => removeField(index)}>
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addField}>
        Add Field
      </Button>
    </Box>
  );
}

export default EditEntityForm;
