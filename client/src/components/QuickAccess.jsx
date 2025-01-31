import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { getAnalytics } from "../utils/analytics";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Crown-like icon

const QuickAccess = ({ onDefinitionClick }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [definitions, setDefinitions] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const analytics = await getAnalytics();
            const sortedDefinitions = Object.entries(analytics.definition || {})
                .sort(([, a], [, b]) => b - a) // Sort by usage count descending
                .map(([name, count]) => ({ name, count }));
            setDefinitions(sortedDefinitions);
        };
        fetchAnalytics();
    }, []);

    // Helper to get crown color if in top 3
    const getCrownColor = (index) => {
        switch (index) {
            case 0:
                return "#FFD700"; // Gold
            case 1:
                return "#C0C0C0"; // Silver
            case 2:
                return "#CD7F32"; // Bronze
            default:
                return null;
        }
    };

    if (definitions.length === 0) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                    {t("quick_access")}
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />
                <Typography color="textSecondary">
                    {t("quick_access_empty")}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                {t("quick_access")}
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />

            <Box
                sx={{
                    flex: 1,
                    overflow: "auto",
                    padding: 2,
                    backgroundColor: theme.palette.background.paper !== "#fff" ? theme.palette.background.paper : "#e9e9e9",
                    borderRadius: 2,
                }}
            >
                <List>
                    {definitions.map((definition, index) => {
                        const crownColor = getCrownColor(index);

                        return (
                            <ListItemButton
                                key={index}
                                onClick={() => onDefinitionClick(definition)}
                                sx={{
                                    // Make the item smaller
                                    py: 0.5, // Reduced vertical padding
                                    px: 1,   // Reduced horizontal padding
                                    mb: 1,
                                    borderRadius: 2,
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    ":hover": {
                                        transform: "scale(1.01)",
                                        boxShadow: theme.shadows[2],
                                    },
                                    backgroundColor: theme.palette.background.paper !== "#fff" ? theme.palette.background.paper : "#e9e9e9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                {/* Left section (Crown + Number + Definition name) */}
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: "bold", marginRight: 1 }}
                                    >
                                        {index + 1}.
                                    </Typography>

                                    <ListItemIcon sx={{ minWidth: "0", marginRight: 1 }}>
                                        {/* We no longer need additional icon spacing, so minWidth: 0 */}
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: theme.palette.primary.main,
                                                }}
                                            >
                                                {definition.name}
                                            </Typography>
                                        }
                                    // No secondary text here, we'll move usage to the far right
                                    />
                                </Box>

                                {/* Right side (Usage count) */}

                                <Typography variant="caption" color="textSecondary">
                                    {definition.count}
                                    {crownColor && (
                                        <EmojiEventsIcon
                                            sx={{
                                                color: crownColor,
                                                // marginRight: 0.5,
                                            }}
                                            fontSize="small"
                                        />
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
