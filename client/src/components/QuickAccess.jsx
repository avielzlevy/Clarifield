import React, { useEffect, useState, useCallback,useMemo } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { getAnalytics } from "../utils/analytics";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const QuickAccess = ({ onDefinitionClick }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define crown colors for the top three items.
  const crownColors = useMemo(() => ["#FFD700", "#C0C0C0", "#CD7F32"], []);

  const getCrownColor = useCallback(
    (index) => (index < crownColors.length ? crownColors[index] : null),
    [crownColors]
  );

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await getAnalytics();
        const sortedDefinitions = Object.entries(analytics.definition || {})
          .sort(([, a], [, b]) => b - a)
          .map(([name, count]) => ({ name, count }));
        setDefinitions(sortedDefinitions);
      } catch (error) {
        console.error("Error fetching analytics")
        console.debug(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!loading && definitions.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          {t("quick_access")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography color="textSecondary">{t("quick_access_empty")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {t("quick_access")}
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
          height: "92.5%",
        }}
      >
        <List>
          {definitions.map((definition, index) => {
            const crownColor = getCrownColor(index);
            return (
              <ListItemButton
                key={definition.name}
                onClick={() => onDefinitionClick(definition)}
                sx={{
                  py: 0.5,
                  px: 1,
                  mb: 1,
                  borderRadius: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  ":hover": {
                    transform: "scale(1.01)",
                    boxShadow: theme.shadows[2],
                  },
                  backgroundColor: theme.palette.background.paper,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Left section: Index and Definition Name */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mr: 1 }}>
                    {index + 1}.
                  </Typography>
                  <ListItemIcon sx={{ minWidth: 0, mr: 1 }} />
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                      >
                        {definition.name}
                      </Typography>
                    }
                  />
                </Box>
                {/* Right section: Usage count and crown icon (if applicable) */}
                <Typography variant="caption" color="textSecondary">
                  {definition.count}{" "}
                  {crownColor && (
                    <EmojiEventsIcon sx={{ color: crownColor }} fontSize="small" />
                  )}
                </Typography>
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

export default QuickAccess;
