import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Book, Boxes, FileJson } from "lucide-react";

const FilterToolbar = ({ activeFilters, itemsAmount, toggleFilter }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
      <Paper elevation={3} sx={{ p: 1, borderRadius: 4, display: "flex", gap: 2 }}>
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
  );
};

function ToolbarItem({ icon: Icon, label, count, isActive, onClick }) {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 3,
        py: 2,
        borderRadius: 2,
        transition: "all 0.3s ease",
        cursor: "pointer",
        bgcolor: isActive ? theme.palette.custom.light : "transparent",
        color: isActive ? theme.palette.custom.bright : "inherit",
        "&:hover": {
          bgcolor: isActive ? theme.palette.custom.dark : theme.palette.custom.light,
        },
      }}
    >
      <Icon size={20} />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
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

export default FilterToolbar;
