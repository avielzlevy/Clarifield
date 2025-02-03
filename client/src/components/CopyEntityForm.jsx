import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Checkbox, FormControlLabel } from '@mui/material';

/**
 * This is a controlled, recursive checkbox component.
 * - It receives a `field` object with properties: label, selected, and (optionally) children.
 * - It also receives a callback `onChange(path, newField)` which is used to update the field
 *   in the overall state. The `path` is an array of indexes that locates the field in the tree.
 */
function CopyFieldCheckbox({ field, onChange, path = [] }) {
  const isParent = field.children && field.children.length > 0;

  // For a parent, derive checked/indeterminate from its children.
  const allChildrenSelected = isParent ? field.children.every((child) => child.selected) : false;
  const someChildrenSelected = isParent ? field.children.some((child) => child.selected) : false;
  const renderedChecked = isParent ? allChildrenSelected : field.selected;
  const renderedIndeterminate = isParent ? (someChildrenSelected && !allChildrenSelected) : false;

  // When the checkbox is toggled...
  const handleChange = (event) => {
    const newVal = event.target.checked;
    // If this field has children, update them all to the new value.
    const markAll = (fld, value) => {
      let updated = { ...fld, selected: value };
      if (fld.children) {
        updated.children = fld.children.map((child) => markAll(child, value));
      }
      return updated;
    };
    const newField = isParent ? markAll(field, newVal) : { ...field, selected: newVal };
    onChange(path, newField);
  };

  // When a child changes, update the children array.
  const handleChildChange = (childPath, newChildField) => {
    const newChildren = field.children.map((child, index) => {
      if (childPath[0] === index) {
        if (childPath.length === 1) {
          return newChildField;
        } else {
          // Recursively update nested children.
          return updateNested(child, childPath.slice(1), newChildField);
        }
      }
      return child;
    });
    // Optionally update parent's own "selected" based on its children.
    const updatedField = { ...field, children: newChildren, selected: newChildren.every(child => child.selected) };
    onChange(path, updatedField);
  };

  // Helper for updating a nested field.
  const updateNested = (fld, childPath, newChildField) => {
    if (childPath.length === 0) return newChildField;
    const index = childPath[0];
    const newChildren = fld.children.map((child, i) => {
      if (i === index) {
        return updateNested(child, childPath.slice(1), newChildField);
      }
      return child;
    });
    return { ...fld, children: newChildren, selected: newChildren.every(child => child.selected) };
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <FormControlLabel
        label={field.label}
        control={
          <Checkbox
            checked={renderedChecked}
            indeterminate={renderedIndeterminate}
            onChange={handleChange}
          />
        }
      />
      {isParent && (
        <Box sx={{ ml: 3 }}>
          {field.children.map((child, index) => (
            <CopyFieldCheckbox
              key={index}
              field={child}
              path={[...path, index]}
              onChange={handleChildChange}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

/**
 * CopyEntityForm is used in "copy" mode to let the user select the fields.
 * It uses forwardRef so that the parent dialog can call getSelectedFields() when needed.
 */
const CopyEntityForm = forwardRef(({ node }, ref) => {
  // Initialize state from node.data.fields by adding a selected property.
  const [fields, setFields] = useState(() => {
    const addSelected = (fieldsArray) =>
      fieldsArray.map((field) => ({
        ...field,
        selected: false,
        children: field.children ? addSelected(field.children) : undefined,
      }));
    return addSelected(node.data.fields || []);
  });

  // Update the field at the given path in the tree.
  const handleFieldChange = (path, newField) => {
    setFields((prev) => {
      const newFields = [...prev];
      const updateAtPath = (arr, path, value) => {
        if (path.length === 1) {
          arr[path[0]] = value;
        } else {
          updateAtPath(arr[path[0]].children, path.slice(1), value);
          // Optionally update parent's selected property.
          arr[path[0]].selected = arr[path[0]].children.every((child) => child.selected);
        }
      };
      updateAtPath(newFields, path, newField);
      return newFields;
    });
  };

  // Expose a method to get the selected fields. We filter out any fields that were not checked.
  useImperativeHandle(ref, () => ({
    getSelectedFields: () => {
      const filterSelected = (fieldsArray) =>
        fieldsArray.reduce((acc, field) => {
          if (field.selected) {
            // If the field has children, include only the selected ones (if any).
            const newField = { label: field.label };
            if (field.children) {
              const filteredChildren = filterSelected(field.children);
              if (filteredChildren.length > 0) {
                newField.children = filteredChildren;
              }
            }
            acc.push(newField);
          }
          return acc;
        }, []);
      return filterSelected(fields);
    },
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {fields.map((field, index) => (
        <CopyFieldCheckbox
          key={index}
          field={field}
          path={[index]}
          onChange={handleFieldChange}
        />
      ))}
    </Box>
  );
});

export default CopyEntityForm;
