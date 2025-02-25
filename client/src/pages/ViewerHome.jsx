import React, { useState } from "react";
import { Box, Paper } from "@mui/material";
import ChangeLog from "../components/ChangeLog";
import QuickAccess from "../components/QuickAccess";
import FilterToolbar from "../components/FilterToolbar";

const ViewerHomepage = () => {
  // Active filters state – all active by default
  const [activeFilters, setActiveFilters] = useState({
    entities: true,
    definitions: true,
    formats: true,
  });

  // Toggle filter state
  const toggleFilter = (filterKey) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  return (
    <>
      <FilterToolbar activeFilters={activeFilters} toggleFilter={toggleFilter} />

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
