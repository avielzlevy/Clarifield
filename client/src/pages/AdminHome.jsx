import React, { useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";
import Reports from "../components/Reports";
import ChangeLog from "../components/ChangeLog";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import FilterToolbar from "../components/FilterToolbar";

const paperSx = {
  flex: 1,
  p: 2,
  display: "flex",
  flexDirection: "column",
  height: "65vh"
};

const AdminHomepage = () => {
  const [activeFilters, setActiveFilters] = useState({
    entities: true,
    definitions: true,
    formats: true,
  });

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

  const toggleFilter = (filterKey) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  return (
    <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 2, height: "89.5vh" }}>
      <FilterToolbar activeFilters={activeFilters} itemsAmount={itemsAmount} toggleFilter={toggleFilter} />
      <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
        <Paper sx={paperSx}>
          <Reports activeFilters={activeFilters} />
        </Paper>
        <Paper sx={paperSx}>
          <ChangeLog activeFilters={activeFilters} />
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminHomepage;
