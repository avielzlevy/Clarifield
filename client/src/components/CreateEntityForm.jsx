import React from 'react';
import {
    Paper,
    TextField,
    Box,
    Autocomplete,
    IconButton,
    Button,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const CreateEntityForm = (props) => {
    const { definitions = {}, entities = {}, newEntity, setNewEntity } = props;

    // Build options from definitions and entities, each with a group label.
    const defOptions = Object.keys(definitions).map((key) => ({
        label: key,
        group: 'Definitions',
    }));
    const entityOptions = Object.keys(entities).map((key) => ({
        label: key,
        group: 'Entities',
    }));
    const options = [...defOptions, ...entityOptions];

    // Handle changes coming either from selection (object) or free input (string)
    const handleFieldChange = (index, newValue) => {
        let label = '';
        let group = null;
      
        // If newValue is an object, use its label and group directly.
        if (typeof newValue === 'object' && newValue !== null) {
          label = newValue.label;
          group = newValue.group;
        } else if (typeof newValue === 'string') {
          // newValue is a string (freeSolo input), so use it as the label.
          label = newValue;
          // Look up the value in definitions and entities:
          if (definitions && definitions.hasOwnProperty(newValue)) {
            group = 'Definitions';
          } else if (entities && entities.hasOwnProperty(newValue)) {
            group = 'Entities';
          }
        }
      
        if (!group) {
          console.log(`${label} is not a valid group`);
        }
      
        const newFields = [...newEntity.fields];
        newFields[index] = {
          ...newFields[index],
          label,
          // Set type based on group; you can adjust the fallback as needed.
          type: group === 'Definitions' ? 'definition' : group === 'Entities' ? 'entity' : 'unknown',
        };
        setNewEntity({ ...newEntity, fields: newFields });
      };
      

    const addField = () => {
        setNewEntity({
            ...newEntity,
            fields: [...newEntity.fields, { label: '' }],
        });
    };

    const removeField = (index) => {
        setNewEntity({
            ...newEntity,
            fields: newEntity.fields.filter((_, i) => i !== index),
        });
    };

    return (
        <Paper sx={{ p: 2 }}>
            <TextField label="Entity Name" variant="outlined" fullWidth
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
                {newEntity && newEntity.fields.map((field, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                        }}
                    >
                        <Autocomplete
                            freeSolo
                            options={options}
                            // Group options by their assigned group.
                            groupBy={(option) =>
                                typeof option === 'object' && option.group ? option.group : ''
                            }
                            // Use the option's label; if the option is a string, return it directly.
                            getOptionLabel={(option) =>
                                typeof option === 'string' ? option : option.label
                            }
                            // The current value is kept as a string in our state.
                            value={field.label}
                            // onChange is triggered when the user selects an option.
                            onChange={(event, newValue) => handleFieldChange(index, newValue)}
                            // onInputChange is triggered on every keystroke.
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
                        {newEntity.fields && newEntity.fields.length > 1 && (
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
