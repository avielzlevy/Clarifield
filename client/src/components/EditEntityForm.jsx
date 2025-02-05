import React from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';

function EditEntityForm(props) {
    const { node, setNode, definitions } = props;

    const handleFieldChange = (index, newValue) => {
        const newFields = [...node.fields];
        newFields[index] = { ...newFields[index], label: newValue };
        setNode({ ...node, fields: newFields });
    };

    return (
        <Box sx={{}}>
            {node && node.fields.map((field, index) => (
                <Autocomplete
                    key={index}
                    options={Object.keys(definitions)}
                    value={field.label}
                    onChange={(event, newValue) => handleFieldChange(index, newValue)}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label={`Field ${index + 1}`} 
                            variant="outlined" 
                            fullWidth
                        />
                    )}
                />
            ))}
        </Box>
    );
}

export default EditEntityForm;