import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getAnalytics } from "../utils/analytics";
import { Box, Tabs, Tab, Paper, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Helper to prepare data for a given dataset (formats or definitions)
const prepareChartData = (dataObj, bgColor, borderColor) => {
  const entries = Object.entries(dataObj).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([key]) => key);
  const values = entries.map(([, value]) => value);
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
};

const Analytics = () => {
  const [formatsData, setFormatsData] = useState({ labels: [], datasets: [] });
  const [definitionsData, setDefinitionsData] = useState({ labels: [], datasets: [] });
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analytics = await getAnalytics();
        if (!analytics || (!analytics.format && !analytics.definition)) {
          setFormatsData({ labels: [], datasets: [] });
          setDefinitionsData({ labels: [], datasets: [] });
          return;
        }
        // Prepare chart data if available.
        if (analytics.format) {
          setFormatsData(
            prepareChartData(
              analytics.format,
              "rgba(75, 192, 192, 0.6)",
              "rgba(75, 192, 192, 1)"
            )
          );
        } else {
          setFormatsData({ labels: [], datasets: [] });
        }
        if (analytics.definition) {
          setDefinitionsData(
            prepareChartData(
              analytics.definition,
              "rgba(153, 102, 255, 0.6)",
              "rgba(153, 102, 255, 1)"
            )
          );
        } else {
          setDefinitionsData({ labels: [], datasets: [] });
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const commonOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true },
    },
    plugins: { legend: { display: false } },
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, height: "calc(100vh - 90px)", overflow: "hidden" }}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label={t("formats")} />
          <Tab label={t("definitions")} />
        </Tabs>
        <Box sx={{ flex: 1, overflow: "auto", mt: 2 }}>
          {activeTab === 0 && <Bar data={formatsData} options={commonOptions} />}
          {activeTab === 1 && <Bar data={definitionsData} options={commonOptions} />}
        </Box>
      </Box>
    </Paper>
  );
};

export default Analytics;
