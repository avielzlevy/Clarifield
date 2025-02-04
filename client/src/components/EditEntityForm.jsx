import React from 'react'
import { TextField,Box } from '@mui/material'
//WIP looking to make every textfield an autocomplete field
//the fields must be populated with available fields from definitions
function EditEntityForm(props) {
    const { node, setNode } = props;
    console.log('editing node:', node);
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
        }}>
            {node && node && node.fields.map((field, index) => (
                <TextField
                    key={index}
                    value={field.label}
                    onChange={(e) => {
                        const newFields = [...node.fields];
                        newFields[index] = { ...field, label: e.target.value };
                        setNode({ ...node,  fields: newFields });
                    }}
                />
            ))}
        </Box>
    )
}

export default EditEntityForm