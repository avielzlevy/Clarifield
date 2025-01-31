import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
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

    useEffect(() => {
        if (reportedItem) {
            setReportData({
                type: reportedItem.pattern ? "format" : "definition",
                name: reportedItem.name || "",
                description: "",
            });
        }
    }, [reportedItem]);

    const handleDescriptionChange = (e) => {
        setReportData((prevData) => ({
            ...prevData,
            description: e.target.value,
        }));
    };

    const addReport = async (report) => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/report/${report.name}`,
                {
                    type: report.type,
                    description: report.description,
                }
            );
            enqueueSnackbar("Report submitted successfully", { variant: "success" });
        } catch (error) {
            console.error("Error submitting report:", error);
            enqueueSnackbar("Error submitting report", { variant: "error" });
        }
    };

    const handleSubmit = async () => {
        await addReport(reportData);
        setReportData({
            type: "",
            name: "",
            description: "",
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Submit a Report</DialogTitle>
            <DialogContent>
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
                    focused
                    value={reportData.description}
                    onChange={handleDescriptionChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={!reportData.description.trim()}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReportDialog;
