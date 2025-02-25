import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { getAnalytics } from "../utils/analytics";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Boxes, FileJson, Book } from "lucide-react";

const QuickAccess = ({ activeFilters }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [mostUsedItems, setMostUsedItems] = useState([]);
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
        // Combine analytics for definitions, entities, and formats
        const combinedItems = [
          ...Object.entries(analytics.definition || {}).map(([name, count]) => ({
            name,
            count,
            category: "definition",
          })),
          ...Object.entries(analytics.entity || {}).map(([name, count]) => ({
            name,
            count,
            category: "entity",
          })),
          ...Object.entries(analytics.format || {}).map(([name, count]) => ({
            name,
            count,
            category: "format",
          })),
        ];
        // Sort by count in descending order
        const sortedItems = combinedItems.sort((a, b) => b.count - a.count);
        setMostUsedItems(sortedItems);
      } catch (error) {
        console.error("Error fetching analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Filter analytics items based on activeFilters
  const filteredItems = useMemo(() => {
    let items = mostUsedItems;
    if (!activeFilters.definitions) {
      items = items.filter((item) => item.category !== "definition");
    }
    if (!activeFilters.entities) {
      items = items.filter((item) => item.category !== "entity");
    }
    if (!activeFilters.formats) {
      items = items.filter((item) => item.category !== "format");
    }
    return items;
  }, [mostUsedItems, activeFilters]);

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

  if (!loading && filteredItems.length === 0) {
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
          {filteredItems.map((item, index) => {
            const crownColor = getCrownColor(index);
            let icon = null;
            if (item.category === "format") {
              icon = <FileJson size={16} />;
            } else if (item.category === "definition") {
              icon = <Book size={16} />;
            } else if (item.category === "entity") {
              icon = <Boxes size={16} />;
            }
            return (
              <ListItem
                key={item.name}
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
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mr: 1 }}>
                    {index + 1}.
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {icon}
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                        >
                          {item.name}
                        </Typography>
                      }
                    />
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {crownColor && <EmojiEventsIcon sx={{ color: crownColor }} fontSize="small" />}
                  <Typography variant="caption" color="textSecondary">
                    {item.count}
                  </Typography>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

export default QuickAccess;
