import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  IconButton,
  Button,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ImportContactsOutlinedIcon from '@mui/icons-material/ImportContactsOutlined';

function EditEntityForm({ node, setNode, definitions, entities }) {
  // Build grouped options from definitions and entities.
  const defOptions = Object.keys(definitions).map((key) => ({
    label: key,
    group: 'Definitions',
  }));
  const entityOptions = Object.keys(entities).map((key) => ({
    label: key,
    group: 'Entities',
  }));
  const options = [...entityOptions,...defOptions];

  // Map group names to icon components.
  const groupIconMap = {
    Definitions: <ImportContactsOutlinedIcon sx={{ fontSize: '1.2rem', mr: 0.5 }} />,
    Entities: <DataObjectIcon sx={{ fontSize: '1.2rem', mr: 0.5 }} />,
  };

  // Update a field's value and its type based on the selected option.
  const handleFieldChange = (index, newValue) => {
    let label = '';
    let group = null;

    if (typeof newValue === 'object' && newValue !== null) {
      label = newValue.label;
      group = newValue.group;
    } else if (typeof newValue === 'string') {
      label = newValue;
      if (definitions && definitions.hasOwnProperty(newValue)) {
        group = 'Definitions';
      } else if (entities && entities.hasOwnProperty(newValue)) {
        group = 'Entities';
      }
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 250 }}>
      {node &&
        node.fields.map((field, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Autocomplete
              freeSolo
              options={options}
              groupBy={(option) => option.group || ''}
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.label
              }
              value={field.label}
              onChange={(event, newValue) => handleFieldChange(index, newValue)}
              onInputChange={(event, newInputValue) => handleFieldChange(index, newInputValue)}
              renderInput={(params) => (
                <TextField {...params} label={`Field ${index + 1}`} variant="outlined" fullWidth />
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
