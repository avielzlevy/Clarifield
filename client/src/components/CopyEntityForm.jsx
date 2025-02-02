import React from 'react';
import { Box, Checkbox, FormControlLabel } from '@mui/material';

// This component renders a field. If the field has children, it renders them recursively.
function FieldCheckbox({ field }) {
    console.log('field:', field);
  // Check if the field has children
  const isParent = field.children && field.children.length > 0;
  
  // For a simple field (no children) we store its own checked state.
  // For a parent, we will derive its checked state from the children.
  const [checked, setChecked] = React.useState(false);
  
  // For a parent field, store an array of booleans for each child.
  const [childChecked, setChildChecked] = React.useState(
    isParent ? field.children.map(() => false) : []
  );

  // If the field is a parent, determine whether all children are checked or only some
  const allChildrenChecked = isParent ? childChecked.every(Boolean) : false;
  const someChildrenChecked = isParent ? childChecked.some(Boolean) : false;

  // The parent's rendered checkbox:
  // - For a simple field, use its own "checked" state.
  // - For a parent, show it as checked if all children are checked.
  // - Also, mark it as "indeterminate" if only some (but not all) children are checked.
  const renderedChecked = isParent ? allChildrenChecked : checked;
  const renderedIndeterminate = isParent ? (someChildrenChecked && !allChildrenChecked) : false;

  // When the parent checkbox changes:
  // - If this field is a parent, update all children to the new value.
  // - Otherwise, update its own state.
  const handleParentChange = (event) => {
    const newVal = event.target.checked;
    if (isParent) {
      setChildChecked(childChecked.map(() => newVal));
    } else {
      setChecked(newVal);
    }
  };

  // Handle a change in a child checkbox.
  const handleChildChange = (index, event) => {
    const newVal = event.target.checked;
    setChildChecked((prev) => {
      const next = [...prev];
      next[index] = newVal;
      return next;
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <FormControlLabel
        label={field.label}
        control={
          <Checkbox
            checked={renderedChecked}
            indeterminate={renderedIndeterminate}
            onChange={handleParentChange}
          />
        }
      />
      {isParent && (
        <Box sx={{ ml: 3 }}>
          {field.children.map((child, index) => (
            // Note: Here we use FieldCheckbox recursively so that children could in
            // turn have their own children.
            <FieldCheckbox
              key={index}
              field={child}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

function EditEntityForm(props) {
  const { node } = props;
  console.log('copying node:', node);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {node &&
        node.data &&
        node.data.fields.map((field, index) => (
          <FieldCheckbox key={index} field={field} />
        ))}
    </Box>
  );
}

export default EditEntityForm;
