import React, {useEffect, useCallback } from "react";
import { Box, TextField } from "@mui/material";

const ReportEntityForm = ({ node,report,setReport }) => {

  // Set fields when reportedItem changes
  useEffect(() => {
    if (node) {
      setReport({
        type: 'entity',
        description: "",
      });
    }
  }, [node,setReport]);

  const handleDescriptionChange = useCallback((e) => {
    setReport((prev) => ({ ...prev, description: e.target.value }));
  }, []);

  return (
    <Box>
      <TextField
        fullWidth
        label="Type"
        variant="outlined"
        value={report.type}
        disabled
        margin="normal"
      />
      <TextField
        fullWidth
        label="Name"
        variant="outlined"
        value={node.label}
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
        value={report.description}
        onChange={handleDescriptionChange}
      />
    </Box>
  );
};

export default ReportEntityForm;
