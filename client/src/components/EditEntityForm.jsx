import React, { useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  IconButton,
  Button,
  Typography,
} from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';
// import DataObjectIcon from '@mui/icons-material/DataObject';
// import ImportContactsOutlinedIcon from '@mui/icons-material/ImportContactsOutlined';
import {
  Boxes,
  Trash2 as Trash,
  Book,
  Plus
} from 'lucide-react';
import { useDefinitions } from '../contexts/useDefinitions';
import { useEntities } from '../contexts/useEntities';
import { useTheme } from '@mui/material/styles';

function EditEntityForm({ node, setNode}) {
  const theme = useTheme();
  // Build grouped options from definitions and entities.
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
    Definitions: <Book style={{ fontSize: '1.2rem', mr: 0.5 }} />,
    Entities: <Boxes style={{ fontSize: '1.2rem', mr: 0.5 }} />,
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
        node.fields.map((field, index) => {
          // Exclude options already selected in other fields.
          const selectedLabelsExceptCurrent = node.fields
            .filter((_, i) => i !== index)
            .map((f) => f.label);

            // Filter options based on selected labels and dont allow to select the same label as the main entity
          const filteredOptions = options.filter(
            (option) => !selectedLabelsExceptCurrent.includes(option.label) && option.label !== node.label
          );
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              {node.fields.length > 1 && (
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
    </Box>
  );
}

export default EditEntityForm;
