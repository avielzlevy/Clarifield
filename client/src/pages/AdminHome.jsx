import React, { useState } from "react";
import { Box, Paper } from "@mui/material";
import Reports from "../components/Reports";
import ChangeLog from "../components/ChangeLog";
import FilterToolbar from "../components/FilterToolbar";

const paperSx = {
  flex: 1,
  p: 1,
  display: "flex",
  flexDirection: "column",
  height: "70vh"
};

const AdminHomepage = () => {
  const [activeFilters, setActiveFilters] = useState({
    entities: true,
    definitions: true,
    formats: true,
  });

 

  const toggleFilter = (filterKey) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  return (
    <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 2, height: "89.5vh" }}>
      <FilterToolbar activeFilters={activeFilters} toggleFilter={toggleFilter} />
      <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
      <Paper sx={paperSx}>
          <ChangeLog activeFilters={activeFilters} />
        </Paper>
        <Paper sx={paperSx}>
          <Reports activeFilters={activeFilters} />
        </Paper>

      </Box>
    </Box>
  );
};

export default AdminHomepage;
