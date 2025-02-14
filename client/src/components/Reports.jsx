import React, { useState } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardHeader,
    Divider,
    Chip,
    CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from 'react-i18next';

const Reports = ({ reports, loadingReports }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const theme = useTheme();
    const { t } = useTranslation();

    if (loadingReports) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Typography variant="h6">Reports</Typography>
                <Divider sx={{ marginY: 1 }} />
                <CircularProgress />
            </Box>
        );
    }

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const tabs = [
        { label: "formats", data: reports.formats || {} },
        { label: "definitions", data: reports.definitions || {} },
    ];

    const renderReports = (data) => {
        return Object.entries(data).length === 0 ? (
            <Typography>{t('reports_empty')}</Typography>
        ) : (
            Object.entries(data).map(([name, descriptions]) => (
                <Card key={name} elevation={3} sx={{ marginBottom: 2 }}>
                    <CardHeader
                        title={name}
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
                        {descriptions.map((desc, index) => (
                            <Chip
                                key={index}
                                label={desc}
                                variant="outlined"
                                size="small"
                                sx={{ backgroundColor: theme.palette.background.paper !== "#fff" ? theme.palette.background.paper : "#e9e9e9", fontWeight: "bold", maxWidth: '25vw' }}
                            />
                        ))}
                    </Box>
                </Card>
            ))
        );
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{
                display: "flex",
                justifyContent: 'center',
            }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>{t('reports')}</Typography>
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                height: "92.5%",
                backgroundColor: theme.palette.background.default,
                borderRadius: 2,
            }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    sx={{ marginBottom: 2 }}
                >
                    {tabs.map((tab, index) => (
                        <Tab key={index} label={t(tab.label)} />
                    ))}
                </Tabs>
                <Box
                    sx={{
                        flex: 1,
                        overflow: "auto",
                        padding: 2,
                    }}
                >
                    {renderReports(tabs[selectedTab].data)}
                </Box>
            </Box>
        </Box >
    );
};

export default Reports;
