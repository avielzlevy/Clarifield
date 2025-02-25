import React, { useState, useEffect } from "react";
import { Box, Grid, Paper } from "@mui/material";
import ChangeLog from "../components/ChangeLog";
import QuickAccess from "../components/QuickAccess";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import FilterToolbar from "../components/FilterToolbar";

const ViewerHomepage = () => {
  // Active filters state – all active by default
  const [activeFilters, setActiveFilters] = useState({
    entities: true,
    definitions: true,
    formats: true,
  });

  // Data states for toolbar counts (handled at page level)
  const [itemsAmount, setItemsAmount] = useState({ formats: 0, definitions: 0, entities: 0 });

  useEffect(() => {
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
        setItemsAmount({
          formats: formatsAmount.amount,
          definitions: definitionsAmount.amount,
          entities: entitiesAmount.amount,
        });
      } catch (error) {
        console.error("Error fetching items amount:", error);
        enqueueSnackbar("Error fetching items amount", { variant: "error" });
      }
    };

    fetchItemsAmount();
  }, []);

  // Toggle filter state
  const toggleFilter = (filterKey) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  return (
    <>
      <FilterToolbar activeFilters={activeFilters} itemsAmount={itemsAmount} toggleFilter={toggleFilter} />

      <Box sx={{ p: 3, display: "flex", gap: 3 }}>
        <Paper sx={{ p: 2, minWidth: "25vw", width: "50%", height: "65vh" }}>
          <ChangeLog activeFilters={activeFilters} />
        </Paper>
        <Paper sx={{ p: 2, minWidth: "25vw", width: "50%", height: "65vh" }}>
          <QuickAccess activeFilters={activeFilters} />
        </Paper>
      </Box>
    </>
  );
};

export default ViewerHomepage;
