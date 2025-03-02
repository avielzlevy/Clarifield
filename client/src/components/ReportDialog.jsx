import React, { useState, useEffect, useCallback } from "react";
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

  // When reportedItem changes, update reportData.
  useEffect(() => {
    if (reportedItem) {
      setReportData({
        type: reportedItem.pattern ? "format" : "definition",
        name: reportedItem.name || "",
        description: "",
      });
    }
  }, [reportedItem]);

  // Handle description change.
  const handleDescriptionChange = useCallback((e) => {
    const { value } = e.target;
    setReportData((prev) => ({ ...prev, description: value }));
  }, []);

  // Send the report via an API call.
  const submitReport = useCallback(async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/report/${reportData.name}`,
        {
          type: reportData.type,
          description: reportData.description,
        }
      );
      enqueueSnackbar("Report submitted successfully", { variant: "success" });
    } catch (error) {
      console.error("Error submitting report:", error);
      enqueueSnackbar("Error submitting report", { variant: "error" });
    }
  }, [reportData]);

  // Handle form submission.
  const handleSubmit = useCallback(async () => {
    await submitReport();
    setReportData({ type: "", name: "", description: "" });
    onClose();
  }, [submitReport, onClose]);

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
            handleSubmit()
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
