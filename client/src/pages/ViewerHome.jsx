import React, { useState, useEffect } from "react";
import {
  Box,
  Grid2 as Grid,
  Paper,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import ChangeLog from "../components/ChangeLog";
import QuickAccess from "../components/QuickAccess";
import Addons from "../components/Addons";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { DataObject, ImportContacts, TextFields } from "@mui/icons-material";
import Icon from '@mui/material/Icon';

const ViewerHomepage = () => {
  const [changeLog, setChangeLog] = useState({ formats: [], definitions: [] });
  const [addons, setAddons] = useState([]);
  const [loadingChangeLog, setLoadingChangeLog] = useState(true);
  const [itemsAmount, setItemsAmount] = useState({ formats: 0, definitions: 0, entities: 0 });

  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/changes`
        );

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

    const fetchItemsAmount = async () => {
      try {
        const { data: definitionsAmount } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/definitions/amount`
        );
        const { data: formatsAmount } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/formats/amount`
        );
        const { data: entitiesAmount } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/entities/amount`
        );
        setItemsAmount({ formats: formatsAmount.amount, definitions: definitionsAmount.amount, entities: entitiesAmount.amount });
      }
      catch (error) {
        console.error("Error fetching items amount:", error);
        enqueueSnackbar("Error fetching items amount", { variant: "error" });
      }
    };

    fetchItemsAmount();
    fetchChangeLog();
    fetchAddons();
  }, []);

  const AmountPaper = ({ title, amount, icon }) => (
    <Paper sx={{ p: 2, minWidth: '25vw' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">
          {title}
        </Typography>
        <Box
          sx={{
            display: "inline-flex", // Center the icon
            alignItems: "center",
            justifyContent: "center",
            width: 40, // Adjust as needed
            height: 40,
            borderRadius: "20%",
            backgroundColor: "#b4b4b418", // Change color as needed
            color: "black", // Icon color
          }}
        >

          {icon}
        </Box>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {amount}
      </Typography>
    </Paper>
  );
  return (
    <Box sx={{ p: 3 }}>
      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <AmountPaper title="Entities" amount={itemsAmount.entities} icon={<DataObject color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <AmountPaper title="Definitions" amount={itemsAmount.definitions} icon={<ImportContacts color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <AmountPaper title="Formats" amount={itemsAmount.formats} icon={<TextFields color="primary" />} />
        </Grid>
      </Grid>

      {/* Main Content: Recent Activity & Popular Definitions */}
      <Grid container spacing={2}>
        {/* Left side: Recent Activity (ChangeLog) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, width: '25vw', height: '65vh' }}>
            <ChangeLog
              changeLog={changeLog}
              loadingChangeLog={loadingChangeLog}
            />
          </Paper>
        </Grid>

        {/* Right side: Popular Definitions (QuickAccess) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 , minWidth: '25vw',height: '65vh'}}>
            <QuickAccess onDefinitionClick={() => { }} />
          </Paper>
        </Grid>

        {/* Example Addons Section (Optional) */}
        {/* 
          If you still want to display Addons, you could place them
          below or above the grid. Here’s an example at full width:
        */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2,minWidth:'25vw',height:'65vh' }}>
            <Addons files={addons} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewerHomepage;
