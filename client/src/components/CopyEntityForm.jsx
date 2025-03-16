import React, { useState, useCallback, useMemo } from "react";
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { Boxes } from "lucide-react";

function CopyEntityForm({ node, onCheckChange }) {
  const [checked, setChecked] = useState([]);

  const handleCheckboxChange = useCallback((field) => {
    setChecked((prev) => {
      const isChecked = prev.some((item) => item.label === field.label);
      const newChecked = isChecked
        ? prev.filter((item) => item.label !== field.label)
        : [...prev, field];

      onCheckChange(newChecked);
      return newChecked;
    });
  }, [onCheckChange]);

  const checkedMap = useMemo(
    () => new Set(checked.map((item) => item.label)),
    [checked]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }} dir='ltr'>
      {node?.fields?.map((field) => (
        <FormControlLabel
          key={field.label}
          control={
            <Checkbox
              checked={checkedMap.has(field.label)}
              onChange={() => handleCheckboxChange(field)}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography>{field.label}</Typography>
              {field.type === "entity" && (
                <Boxes
                  style={{
                    height: 16,
                    width: 16,
                    color: "primary.main",
                    marginLeft: "10px",
                  }}
                />
              )}
            </Box>
          }
        />
      ))}
    </Box>
  );
}

export default CopyEntityForm;
