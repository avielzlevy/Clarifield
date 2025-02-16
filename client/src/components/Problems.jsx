import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  Divider,
  Chip,
  CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { useTranslation } from "react-i18next";

const Problems = () => {
  const theme = useTheme();
  // Set initial state to an empty array instead of an object
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const { t } = useTranslation();

  const fetchDefinitions = async () => {
    try {
      // Fetch definitions and formats
      const [definitionsRes, formatsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/formats`),
      ]);

      const definitionsData = definitionsRes.data;
      const formatsData = formatsRes.data;

      // Step 1: Build a mapping from format names to definitions that use them
      const formatToDefinitionsMap = {};

      Object.entries(definitionsData).forEach(([defName, defData]) => {
        const formatName = defData.format;
        if (!formatToDefinitionsMap[formatName]) {
          formatToDefinitionsMap[formatName] = [];
        }
        formatToDefinitionsMap[formatName].push(defName);
      });

      // Step 2: Find formats without patterns
      const formatsWithoutPattern = Object.keys(formatToDefinitionsMap).filter(
        (formatName) => {
          const formatData = formatsData[formatName];
          return !formatData || !formatData.pattern;
        }
      );

      // Step 3: Prepare the ProblemsArray
      const ProblemsArray = formatsWithoutPattern.map((formatName) => ({
        format: formatName,
        definitions: formatToDefinitionsMap[formatName],
      }));

      setProblems(ProblemsArray);
      setLoadingProblems(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoadingProblems(false);
    }
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);

  if (loadingProblems) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6">{t('problems')}</Typography>
        <Divider sx={{ marginY: 1 }} />
        <CircularProgress />
      </Box>
    );
  }

  const renderProblems = (problems) => {
    return problems.length === 0 ? (
      <Typography>{t('problems_empty')}</Typography>
    ) : (
      problems.map((problem) => (
        <Card key={problem.format} elevation={3} sx={{ marginBottom: 2 }}>
          <CardHeader
            title={problem.format}
            titleTypographyProps={{
              variant: "subtitle1",
              color: "primary",
              fontWeight: "bold",
            }}
            sx={{ padding: 1 }}
          />
          <Divider />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              padding: 2,
            }}
          >
            {t('affecting')}:
            <Chip
              key={problem.definitions}
              label={problem.definitions.join(", ")}
              variant="outlined"
              size="small"
              sx={{
                backgroundColor:
                  theme.palette.background.default,
                fontWeight: "bold",
                maxWidth: '25vw'
              }}
            />
          </Box>
        </Card>
      ))
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
          {t('problems')}
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          padding: 2,
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
        }}
      >
        {renderProblems(problems)}
      </Box>
    </Box>
  );
};

export default Problems;
