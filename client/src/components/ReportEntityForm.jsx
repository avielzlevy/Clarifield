import React, { useEffect, useCallback } from "react";
import { Box, TextField } from "@mui/material";

const ReportEntityForm = ({ node, report, setReport }) => {
  useEffect(() => {
    if (node) {
      setReport((prev) => ({
        ...prev,
        type: prev?.type || "entity", // Ensure type is always set
        description: prev?.description || "",
      }));
    }
  }, [node, setReport]);

  const handleDescriptionChange = useCallback(
    (e) => {
      setReport((prev) => ({ ...prev, description: e.target.value }));
    },
    [setReport]
  );

  if (!node) return null; // Prevent rendering if node is undefined

  return (
    <Box>
      <TextField
        fullWidth
        label="Type"
        variant="outlined"
        value={report?.type || "entity"}
        disabled
        margin="normal"
      />
      <TextField
        fullWidth
        label="Name"
        variant="outlined"
        value={node?.label || "Unnamed"}
        disabled
        margin="normal"
      />
      <TextField
        fullWidth
        variant="outlined"
        label="Description"
        margin="normal"
        multiline
        rows={4}
        value={report?.description || ""}
        onChange={handleDescriptionChange}
      />
    </Box>
  );
};

export default React.memo(ReportEntityForm);
