import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Book, FileJson } from "lucide-react";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

const Reports = ({ activeFilters }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [reportsData, setReportsData] = useState({});
  const [loadingReports, setLoadingReports] = useState(true);

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
    ];
    // Filter based on activeFilters: if the relevant filter is off, skip that category.
    return combined.filter((report) => {
      if (report.category === "format" && !activeFilters.formats) return false;
      if (report.category === "definition" && !activeFilters.definitions) return false;
      return true;
    });
  }, [reportsData, activeFilters]);

  const renderDescriptions = (descriptions) => {
    const descArray = Array.isArray(descriptions) ? descriptions : [descriptions];
    return descArray.map((desc, idx) => {
      let label;
      if (typeof desc === "object" && desc !== null) {
        label = `${desc.description} (${desc.status})`;
      } else {
        label = desc;
      }
      return (
        <Chip
          key={idx}
          label={label}
          variant="outlined"
          size="small"
          sx={{
            backgroundColor:
              theme.palette.background.paper !== "#fff"
                ? theme.palette.background.paper
                : "#e9e9e9",
            fontWeight: "bold",
            maxWidth: "25vw",
          }}
        />
      );
    });
  };

  // Return the relevant icon for each category.
  const getIconForCategory = (category) => {
    if (category === "format") {
      return <FileJson size={24} />;
    } else if (category === "definition") {
      return <Book size={24} />;
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

  if (combinedReports.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>{t("reports_empty")}</Typography>
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
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
          p: 2,
        }}
      >
        {combinedReports.map((report) => (
          <Card key={report.name} elevation={3} sx={{ mb: 2 }}>
            <CardHeader
              avatar={getIconForCategory(report.category)}
              title={report.name}
              titleTypographyProps={{
                variant: "subtitle1",
                color: "primary",
                fontWeight: "bold",
              }}
              sx={{ p: 1 }}
            />
            <Divider />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                p: 2,
              }}
            >
              {renderDescriptions(report.descriptions)}
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Reports;
