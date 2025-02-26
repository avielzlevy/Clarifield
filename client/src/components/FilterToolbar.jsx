import React, { useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Book, Boxes, FileJson } from "lucide-react";
import axios from "axios";
import { useSnackbar } from "notistack";

const FilterToolbar = ({ activeFilters, toggleFilter }) => {
  const { enqueueSnackbar } = useSnackbar();
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
  }, [enqueueSnackbar]);
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
