import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Collapse,
  Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Book, FileJson, ChevronDown, Boxes } from "lucide-react";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

const Reports = ({ activeFilters }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [reportsData, setReportsData] = useState({});
  const [loadingReports, setLoadingReports] = useState(true);
  // Track which report items are expanded using a keyed object.
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/reports`
        );
        setReportsData(data);
      } catch (error) {
        console.error("Error fetching reports", error);
        enqueueSnackbar("Error fetching reports", { variant: "error" });
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  // Combine and transform report data from formats and definitions.
  const combinedReports = useMemo(() => {
    const formatsData = reportsData?.formats || reportsData?.format || {};
    const definitionsData = reportsData?.definitions || reportsData?.definition || {};
    const entitiesData = reportsData?.entities || reportsData?.entity || {};
    const combined = [
      ...Object.entries(formatsData).map(([name, descriptions]) => ({
        name,
        descriptions,
        category: "format",
      })),
      ...Object.entries(definitionsData).map(([name, descriptions]) => ({
        name,
        descriptions,
        category: "definition",
      })),
      ...Object.entries(entitiesData).map(([name, descriptions]) => ({
        name,
        descriptions,
        category: "entity",
      })),
    ];
    // Filter based on activeFilters: if the relevant filter is off, skip that category.
    return combined.filter((report) => {
      if (report.category === "format" && !activeFilters.formats) return false;
      if (report.category === "definition" && !activeFilters.definitions) return false;
      if (report.category === "entity" && !activeFilters.entities) return false;
      return true;
    });
  }, [reportsData, activeFilters]);

  // Toggle the expansion state for a given report.
  const handleExpandClick = (report) => {
    const key = `${report.category}:${report.name}`;
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Render individual descriptions. Ensure it works with both arrays and single objects.
  const renderDescriptions = (descriptions) => {
    const descArray = Array.isArray(descriptions) ? descriptions : [descriptions];
    return descArray.map((desc, idx) => {
      let label;
      if (typeof desc === "object" && desc !== null) {
        label = desc.status;
      } else {
        label = desc;
      }
      return (
        <Box
          key={idx}
          sx={{
            display: "flex",
            alignItems: "center",
            padding: 1,
            gap: 1,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Chip
            label={label}
            variant="outlined"
            size="small"
            sx={{
              p: 1,
              py: 0.5,
              backgroundColor:
                theme.palette.background.paper !== "#fff"
                  ? theme.palette.background.paper
                  : "#e9e9e9",
              fontWeight: "bold",
              maxWidth: "25vw",
            }}
          />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {desc.description}
          </Typography>
        </Box>
      );
    });
  };

  // Return the relevant icon for each category.
  const getIconForCategory = (category) => {
    if (category === "format") {
      return <FileJson size={24} style={{ color: theme.palette.custom.bright }} />;
    } else if (category === "definition") {
      return <Book size={24} style={{ color: theme.palette.custom.bright }} />;
    } else if (category === "entity") {
      return <Boxes size={24} style={{ color: theme.palette.custom.bright }} />;
    }
    return null;
  };

  if (loadingReports) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6">{t("reports")}</Typography>
        <Divider sx={{ my: 1 }} />
        <CircularProgress />
      </Box>
    );
  }

  // Render each report as a collapsible card.
  const renderReports = (reports) => {
    return reports.length === 0 ? (
      <Typography>{t("reports_empty")}</Typography>
    ) : (
      reports.map((report) => {
        const key = `${report.category}:${report.name}`;
        const isExpanded = expanded[key] || false;
        // Determine how many descriptions there are.
        const count = Array.isArray(report.descriptions)
          ? report.descriptions.length
          : 1;
        return (
          <Card
            key={key}
            elevation={3}
            sx={{
              marginBottom: 2,
              bgcolor: theme.palette.background.default,
            }}
          >
            <CardHeader
              title={
                <Box display="flex" alignItems="center" justifyContent={"space-between"}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {report.name}
                  </Typography>
                  {/* TODO: maybe make a filter with 3 badges for each category */}
                  <Badge badgeContent={count} color="primary" sx={{
                    mr: 1,
                  }} />
                </Box>
              }
              sx={{ padding: 1 }}
              avatar={getIconForCategory(report.category)}
              action={
                <IconButton onClick={() => handleExpandClick(report)}>
                  <ChevronDown
                    size={24}
                    style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s",
                      color: theme.palette.text.secondary,
                    }}
                  />
                </IconButton>
              }
            />
            <Divider />
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              {renderDescriptions(report.descriptions)}
            </Collapse>
          </Card>
        );
      })
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {t("reports")}
        </Typography>
      </Box>
      {renderReports(combinedReports)}
    </Box>
  );
};

export default Reports;
