import React, { useState, useEffect, useMemo } from "react";
import { Box, Grid2 as Grid, Paper, Typography } from "@mui/material";
import ChangeLog from "../components/ChangeLog";
import QuickAccess from "../components/QuickAccess";
import Addons from "../components/Addons";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { Book, Boxes, FileJson } from "lucide-react";
import { useTheme } from "@emotion/react";

const ViewerHomepage = () => {
  // Active filters state – all active by default
  const [activeFilters, setActiveFilters] = useState({
    entities: true,
    definitions: true,
    formats: true,
  });

  // Data states
  const [changeLog, setChangeLog] = useState({ formats: [], definitions: [] });
  const [addons, setAddons] = useState([]);
  const [loadingChangeLog, setLoadingChangeLog] = useState(true);
  const [itemsAmount, setItemsAmount] = useState({ formats: 0, definitions: 0, entities: 0 });

  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/changes`);
        if (!data.formats || !data.definitions) return;
        setChangeLog({
          formats: data.formats,
          definitions: data.definitions,
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
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/addons`);
        setAddons(data);
      } catch (error) {
        console.error("Error fetching addons:", error);
        enqueueSnackbar("Error fetching addons", { variant: "error" });
      }
    };

    const fetchItemsAmount = async () => {
      try {
        const { data: definitionsAmount } = await axios.get(`${process.env.REACT_APP_API_URL}/api/definitions/amount`);
        const { data: formatsAmount } = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats/amount`);
        const { data: entitiesAmount } = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities/amount`);
        setItemsAmount({
          formats: formatsAmount.amount,
          definitions: definitionsAmount.amount,
          entities: entitiesAmount.amount
        });
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

  // Toggle filter state
  const toggleFilter = (filterKey) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  // Filter ChangeLog data based on active filters for definitions and formats
  const filteredChangeLog = useMemo(() => {
    return {
      entities: activeFilters.entities ? changeLog.definitions : [],
      definitions: activeFilters.definitions ? changeLog.definitions : [],
      formats: activeFilters.formats ? changeLog.formats : [],
    }
  }, [activeFilters, changeLog]);

  return (
    <>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
        <Paper elevation={3} sx={{ p: 1, borderRadius: 4, display: 'flex', gap: 2 }}>
          <ToolbarItem
            icon={Boxes}
            label="Entities"
            count={itemsAmount.entities}
            isActive={activeFilters.entities}
            onClick={() => toggleFilter("entities")}
          />
          <ToolbarItem
            icon={Book}
            label="Definitions"
            count={itemsAmount.definitions}
            isActive={activeFilters.definitions}
            onClick={() => toggleFilter("definitions")}
          />
          <ToolbarItem
            icon={FileJson}
            label="Formats"
            count={itemsAmount.formats}
            isActive={activeFilters.formats}
            onClick={() => toggleFilter("formats")}
          />
        </Paper>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Conditionally render ChangeLog if definitions or formats are active */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2, width: '25vw', height: '65vh' }}>
              <ChangeLog
                changeLog={filteredChangeLog}
                loadingChangeLog={loadingChangeLog}
              />
            </Paper>
          </Grid>

          {/* Conditionally render QuickAccess if entities is active */}
          {activeFilters.entities && (
            <Grid xs={12} md={6}>
              <Paper sx={{ p: 2, minWidth: '25vw', height: '65vh' }}>
                <QuickAccess onDefinitionClick={() => { }} />
              </Paper>
            </Grid>
          )}

          {/* Addons section always visible */}
          {/* <Grid item xs={12}>
            <Paper sx={{ p: 2, minWidth: '25vw', height: '65vh' }}>
              <Addons files={addons} />
            </Paper>
          </Grid> */}
        </Grid>
      </Box>
    </>
  );
};

function ToolbarItem({ icon: Icon, label, count, isActive, onClick }) {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 3,
        py: 2,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        bgcolor: isActive ? theme.palette.custom.light : "transparent",
        color: isActive ? theme.palette.custom.bright : "inherit",
        "&:hover": {
          bgcolor: isActive ? theme.palette.custom.dark : theme.palette.custom.light,
        },
      }}
    >
      <Icon size={20} />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {count}
        </Typography>
      </Box>
    </Box>
  );
}

export default ViewerHomepage;
