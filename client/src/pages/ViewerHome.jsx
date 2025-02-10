import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";
import ChangeLog from "../components/ChangeLog";
import QuickAccess from "../components/QuickAccess";
import Addons from "../components/Addons";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

const ViewerHomepage = () => {
  const [changeLog, setChangeLog] = useState({ formats: [], definitions: [] });
  const [addons, setAddons] = useState([]);
  const [loadingChangeLog, setLoadingChangeLog] = useState(true);


  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        // Fetch the change log from the API
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/changes`
        );
        if (!response.data.formats || !response.data.definitions) {
          return;
        }
        const filteredFormats = response.data.formats.filter((format) =>
          favorites.includes(format.name)
        );

        const filteredDefinitions = response.data.definitions.filter((definition) =>
          favorites.includes(definition.name)
        );

        // Update state with the filtered change log
        setChangeLog({
          formats: filteredFormats,
          definitions: filteredDefinitions,
        });
      } catch (error) {
        console.error("Error fetching change log:", error);
        enqueueSnackbar("Error fetching change log", { variant: "error" });
      } finally {
        setLoadingChangeLog(false);
      }
    };
    const fetchAddons = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/addons`
        );
        setAddons(response.data);
      } catch (error) {
        console.error("Error fetching addons:", error);
        enqueueSnackbar("Error fetching addons", { variant: "error" });
      }
    };
    fetchChangeLog();
    fetchAddons();
  }, []);



  return (
    <Box sx={{ padding: 1, display: "flex", gap: 2, height: "89.5vh" }}>
      {/* Section 1: Empty */}
      <Paper sx={{ flex: 1, padding: 1 }}>
        <Addons files={addons} />
      </Paper>
      {/* Section 2: Empty */}
      <Paper
        sx={{
          flex: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}>
        <QuickAccess onDefinitionClick={() => { }} />
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

export default ViewerHomepage;
