import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";
import Reports from "../components/Reports";
import ChangeLog from "../components/ChangeLog";
import Problems from "../components/Problems";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

const AdminHomepage = () => {
  const [reports, setReports] = useState({});
  const [changeLog, setChangeLog] = useState({ formats: [], definitions: [] });
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingChangeLog, setLoadingChangeLog] = useState(true);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports`);
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        enqueueSnackbar("Error fetching reports", { variant: "error" });
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, []);

  // Fetch change log
  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/changes`);
        setChangeLog(response.data);
      } catch (error) {
        console.error("Error fetching change log:", error);
        enqueueSnackbar("Error fetching change log", { variant: "error" });
      } finally {
        setLoadingChangeLog(false);
      }
    };

    fetchChangeLog();
  }, []);



  return (
    <Box sx={{ padding: 3, display: "flex", gap: 3, height: "93vh" }}>
      {/* Section 1: Reports */}
      <Paper
        sx={{
          flex: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Reports reports={reports} loadingReports={loadingReports} />
      </Paper>

      {/* Section 2: Empty */}
      <Paper
        sx={{
          flex: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Problems />
      </Paper>

      {/* Section 3: Change Log */}
      <Paper
        sx={{
          flex: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <ChangeLog changeLog={changeLog} loadingChangeLog={loadingChangeLog} />
      </Paper>

    </Box>
  );
};

export default AdminHomepage;
