import React, { useState } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Divider,
    CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from 'react-i18next';

const ChangeLog = ({ changeLog, loadingChangeLog }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const theme = useTheme();
    const { t } = useTranslation();
    if (loadingChangeLog) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Typography variant="h6">{t('change_log')}</Typography>
                <Divider sx={{ marginY: 1 }} />
                <CircularProgress />
            </Box>
        );
    }
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const renderChangeLog = (logData) => {
        // Sort by timestamp in descending order (newest first)
        const sortedLogData = [...logData].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        return sortedLogData.map((log, index) => {
            const { name, timestamp, before, after, type } = log;
            const changeType = before === "" ? "created" : after === "" ? "deleted" : "updated";
            const formattedTimestamp = new Date(timestamp).toLocaleString();

            return (
                <Card elevation={3} key={index} sx={{ marginBottom: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle1" color="primary">
                            {`${t(changeType)} ${t(type.slice(0, -1))}: ${name}`}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ display: "block", marginBottom: 1}}
                        >
                            {`${t('timestamp')}: ${formattedTimestamp}`}
                        </Typography>
                        {before && (
                            <Box sx={{ marginBottom: 1 }}>
                                <Typography
                                    variant="body2"
                                    color="error"
                                    fontWeight="bold"
                                >
                                    {t('before')}:
                                </Typography>
                                <Box
                                    dir='ltr'
                                    component="pre"
                                    sx={{
                                        backgroundColor: theme.palette.background.default,
                                        padding: 1,
                                        borderRadius: 5,
                                        whiteSpace: "pre-wrap",
                                        wordWrap: "break-word",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    {JSON.stringify(before, null, 2)}
                                </Box>
                            </Box>
                        )}
                        {after && (
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="success.main"
                                    fontWeight="bold"
                                >
                                    {t('after')}:
                                </Typography>
                                <Box
                                    dir='ltr'
                                    component="pre"
                                    sx={{
                                        padding: 1,
                                        backgroundColor: theme.palette.background.default,
                                        borderRadius: 5,
                                        whiteSpace: "pre-wrap",
                                        wordWrap: "break-word",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    {JSON.stringify(after, null, 2)}
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            );
        });
    };

    const tabs = [
        { label: "formats", data: changeLog.formats || [] },
        { label: "definitions", data: changeLog.definitions || [] },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{
                display: "flex",
                justifyContent: 'center',
            }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>{t('change_log')}</Typography>
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
                    // sx={{ backgroundColor: theme.palette.background.default }}
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
                        // backgroundColor: theme.palette.background.default,
                    }}
                >
                    {tabs[selectedTab].data.length === 0 ? (
                        <Typography>
                            {t('change_log_empty')}
                        </Typography>
                    ) : (
                        renderChangeLog(tabs[selectedTab].data)
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ChangeLog;
