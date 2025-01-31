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
import { Box, Tabs, Tab, Typography, Paper, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [formatsData, setFormatsData] = useState(null);
  const [definitionsData, setDefinitionsData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const analytics = await getAnalytics();

      // Prepare formats data, sorted in descending order
      const formatEntries = Object.entries(analytics.format).sort((a, b) => b[1] - a[1]);
      const formatLabels = formatEntries.map(([key]) => key);
      const formatValues = formatEntries.map(([, value]) => value);
      setFormatsData({
        labels: formatLabels,
        datasets: [
          {
            // label: t("formats"),
            data: formatValues,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });

      // Prepare definitions data, sorted in descending order
      const definitionEntries = Object.entries(analytics.definition).sort((a, b) => b[1] - a[1]);
      const definitionLabels = definitionEntries.map(([key]) => key);
      const definitionValues = definitionEntries.map(([, value]) => value);
      setDefinitionsData({
        labels: definitionLabels,
        datasets: [
          {
            // label: t("definitions"),
            data: definitionValues,
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: 2, margin: 2 }}>
      <Box>
        <Tabs value={activeTab} onChange={handleChange} centered>
          <Tab label={t("formats")} />
          <Tab label={t("definitions")} />
        </Tabs>
      </Box>
      <Box sx={{ marginTop: 2, height: '100%' }}>
        {activeTab === 0 && (
          <Bar
            data={formatsData}
            options={{
              indexAxis: "y",
              responsive: true,
              scales: { x: { beginAtZero: true } },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        )}
        {activeTab === 1 && (
          <Bar
            data={definitionsData}
            options={{
              indexAxis: "y",
              responsive: true,
              scales: { x: { beginAtZero: true } },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default Analytics;
