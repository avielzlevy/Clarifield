import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

const ReportDialog = ({ open, onClose, reportedItem }) => {
  const [reportData, setReportData] = useState({
    type: "",
    name: "",
    description: "",
  });

  // Memoize type to avoid unnecessary state updates
  const reportType = useMemo(
    () => (reportedItem?.pattern ? "format" : "definition"),
    [reportedItem]
  );

  // Sync reportData when reportedItem changes
  useEffect(() => {
    if (reportedItem) {
      setReportData((prev) => ({
        ...prev,
        type: reportType,
        name: reportedItem.name || "",
        description: "",
      }));
    }
  }, [reportedItem, reportType]);

  // Handle input change
  const handleDescriptionChange = useCallback((e) => {
    setReportData((prev) => ({ ...prev, description: e.target.value }));
  }, []);

  // Submit report
  const submitReport = useCallback(async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/report/${reportData.name}`,
        {
          type: reportData.type,
          description: reportData.description.trim(),
        }
      );
      enqueueSnackbar("Report submitted successfully", { variant: "success" });
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit the report";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  }, [reportData, onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Submit a Report</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please provide a brief description of the issue.
        </DialogContentText>
        <TextField
          fullWidth
          variant="outlined"
          label="Type"
          value={reportData.type}
          disabled
          margin="normal"
        />
        <TextField
          fullWidth
          variant="outlined"
          label="Name"
          value={reportData.name}
          disabled
          margin="normal"
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          margin="normal"
          variant="outlined"
          label="Description"
          value={reportData.description}
          onChange={handleDescriptionChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            submitReport();
          }}
          variant="contained"
          color="primary"
          disabled={!reportData.description.trim()}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
