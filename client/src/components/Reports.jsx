// Reports.jsx
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
import { X, Check } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Book, FileJson, ChevronDown, Boxes } from "lucide-react";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

// Helper: returns the icon for each category.
const getIconForCategory = (category, theme) => {
  if (category === "format") {
    return <FileJson size={24} style={{ color: theme.palette.custom.bright }} />;
  } else if (category === "definition") {
    return <Book size={24} style={{ color: theme.palette.custom.bright }} />;
  } else if (category === "entity") {
    return <Boxes size={24} style={{ color: theme.palette.custom.bright }} />;
  }
  return null;
};

// New ReportCard component for each report item.
const ReportCard = ({ report, isExpanded, onToggleExpand, theme, t, refreshReports }) => {
  // Local state for filtering by status.
  const [selectedStatuses, setSelectedStatuses] = useState(['pending', 'accepted', 'rejected']);
  const statuses = ["pending", "accepted", "rejected"];

  // Compute the count of each status among the report's descriptions.
  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  const descriptionsArray = Array.isArray(report.descriptions)
    ? report.descriptions
    : [report.descriptions];

  descriptionsArray.forEach((desc) => {
    if (typeof desc === "object" && desc !== null && desc.status) {
      if (statusCounts.hasOwnProperty(desc.status)) {
        statusCounts[desc.status]++;
      }
    }
  });

  // Toggle the filter for a given status.
  const toggleStatusFilter = (e, status) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Filter descriptions.
  const filteredDescriptions =
    selectedStatuses.length > 0
      ? descriptionsArray.filter(
          (desc) =>
            typeof desc === "object" &&
            desc !== null &&
            selectedStatuses.includes(desc.status)
        )
      : descriptionsArray;

  const statusColors = {
    pending: "#4a91e234",  // Soft blue
    accepted: "#2ecc7034", // Pleasant green
    rejected: "#e74d3c2e", // Muted red
  };

  // Render the filter chips.
  const renderStatusFilters = () => (
    <Box sx={{ display: "flex", gap: 3, p: 1 }}>
      {statuses.map((status) =>
        statusCounts[status] > 0 ? (
          <Badge
            key={status}
            badgeContent={statusCounts[status]}
            color={selectedStatuses.includes(status) ? "primary" : "default"}
            onClick={(e) => toggleStatusFilter(e, status)}
            sx={{
              cursor: "pointer",
              fontWeight: "bold",
              "& .MuiBadge-badge": {
                backgroundColor: selectedStatuses.includes(status)
                  ? statusColors[status]
                  : 'transparent',
                color: theme.palette.text.primary,
                border: selectedStatuses.includes(status) ? undefined : `1px solid ${statusColors[status]}`,
                borderRadius: 3,
              },
            }}
          />
        ) : null
      )}
    </Box>
  );
  

  // New function to update the report's status.
  const handleUpdateStatus = async (e, desc, newStatus) => {
    e.stopPropagation();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/report/${report.name}`, {
        type: report.category,
        name: report.name,
        description: desc.description,
        status: newStatus,
      });
      enqueueSnackbar("Report updated", { variant: "success" });
      // Refresh the reports data.
      refreshReports();
    } catch (error) {
      console.error("Error updating report", error);
      enqueueSnackbar("Error updating report", { variant: "error" });
    }
  };

  // Render each description item.
  const renderDescriptions = () => {
    const animateClick = (target) => {
      target.style.transition = "transform 0.2s";
      target.style.transform = "scale(1.2)";
      setTimeout(() => {
        target.style.transform = "scale(1)";
      }, 200);
    };
    
    return filteredDescriptions.map((desc, idx) => {
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
            p: 1,
            justifyContent: "space-between",
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={label}
              size="small"
              sx={{
                p: 1,
                height: '32px',
                backgroundColor: statusColors[label] || theme.palette.custom.light,
                color: theme.palette.text.primary,
                maxWidth: "25vw",
              }}
            />
            {desc.description && (
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
              >
                {desc.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Check
              size={24}
              onClick={(e) => animateClick(e.target)}
              onDoubleClick={(e) => handleUpdateStatus(e, desc, "accepted")}
              style={{
                color: theme.palette.success.main,
                cursor: "pointer",
              }}
            />
            <X
              size={24}
              onClick={(e) => animateClick(e.target)}
              onDoubleClick={(e) => handleUpdateStatus(e, desc, "rejected")}
              style={{
                color: theme.palette.error.main,
                cursor: "pointer",
              }}
            />
          </Box>
        </Box>
      );
    });
  };

  const cardKey = `${report.category}:${report.name}`;

  return (
    <Card key={cardKey} elevation={1} sx={{ mb: 2, bgcolor: theme.palette.background.default }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight="bold">
              {report.name}
            </Typography>
            {renderStatusFilters()}
          </Box>
        }
        sx={{ p: 1 }}
        avatar={getIconForCategory(report.category, theme)}
        action={
          <IconButton onClick={() => onToggleExpand(report)}>
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
        {renderDescriptions()}
      </Collapse>
    </Card>
  );
};

const Reports = ({ activeFilters }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [reportsData, setReportsData] = useState({});
  const [loadingReports, setLoadingReports] = useState(true);
  const [expanded, setExpanded] = useState({});

  // Extracted fetchReports so it can be reused.
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports`);
      setReportsData(data);
    } catch (error) {
      console.error("Error fetching reports", error);
      enqueueSnackbar("Error fetching reports", { variant: "error" });
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Combine and transform report data.
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
    // Filter based on activeFilters.
    return combined.filter((report) => {
      if (report.category === "format" && !activeFilters.formats) return false;
      if (report.category === "definition" && !activeFilters.definitions) return false;
      if (report.category === "entity" && !activeFilters.entities) return false;
      return true;
    });
  }, [reportsData, activeFilters]);

  // Toggle expansion for a report.
  const handleExpandClick = (report) => {
    const key = `${report.category}:${report.name}`;
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {t("reports")}
        </Typography>
      </Box>
      {combinedReports.length === 0 ? (
        <Typography>{t("reports_empty")}</Typography>
      ) : (
        combinedReports.map((report) => {
          const key = `${report.category}:${report.name}`;
          return (
            <ReportCard
              key={key}
              report={report}
              isExpanded={expanded[key] || false}
              onToggleExpand={handleExpandClick}
              theme={theme}
              t={t}
              refreshReports={fetchReports}  // Pass the refresh function as a prop.
            />
          );
        })
      )}
    </Box>
  );
};

export default Reports;
