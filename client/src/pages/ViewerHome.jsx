import React, { useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";
import ChangeLog from "../components/ChangeLog";
import QuickAccess from "../components/QuickAccess";
import Addons from "../components/Addons";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

// Define a common style for Paper components
const paperSx = {
  flex: 1,
  paddingLeft: 2,
  paddingRight: 2,
  paddingBottom: 2,
};

const ViewerHomepage = () => {
  const [changeLog, setChangeLog] = useState({ formats: [], definitions: [] });
  const [addons, setAddons] = useState([]);
  const [loadingChangeLog, setLoadingChangeLog] = useState(true);

  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/changes`
        );

        // Ensure we have both formats and definitions
        if (!data.formats || !data.definitions) return;

        const filteredFormats = data.formats.filter((format) =>
          favorites.includes(format.name)
        );
        const filteredDefinitions = data.definitions.filter((definition) =>
          favorites.includes(definition.name)
        );

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
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/addons`
        );
        setAddons(data);
      } catch (error) {
        console.error("Error fetching addons:", error);
        enqueueSnackbar("Error fetching addons", { variant: "error" });
      }
    };

    fetchChangeLog();
    fetchAddons();
  }, []);

  return (
    <Box sx={{ display: "flex", gap: 2, height: "89.5vh" }}>
      <Paper sx={paperSx}>
        <Addons files={addons} />
      </Paper>
      <Paper sx={paperSx}>
        <QuickAccess onDefinitionClick={() => {}} />
      </Paper>
      <Paper sx={paperSx}>
        <ChangeLog changeLog={changeLog} loadingChangeLog={loadingChangeLog} />
      </Paper>
    </Box>
  );
};

export default ViewerHomepage;
