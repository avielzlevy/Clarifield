import React, { useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";
import Reports from "../components/Reports";
import ChangeLog from "../components/ChangeLog";
import Problems from "../components/Problems";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

// Common Paper styles for each section
const paperSx = {
  flex: 1,
  p: 2,
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const AdminHomepage = () => {
  const [reports, setReports] = useState({});
  const [changeLog, setChangeLog] = useState({ formats: [], definitions: [] });
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingChangeLog, setLoadingChangeLog] = useState(true);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/reports`
        );
        setReports(data);
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
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/changes`
        );
        setChangeLog(data);
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
    <Box sx={{ p: 1, display: "flex", gap: 2, height: "89.5vh" }}>
      {/* Section 1: Reports */}
      <Paper sx={paperSx}>
        <Reports reports={reports} loadingReports={loadingReports} />
      </Paper>

      {/* Section 2: Problems */}
      <Paper sx={paperSx}>
        <Problems />
      </Paper>

      {/* Section 3: Change Log */}
      <Paper sx={paperSx}>
        <ChangeLog changeLog={changeLog} loadingChangeLog={loadingChangeLog} />
      </Paper>
    </Box>
  );
};

export default AdminHomepage;
