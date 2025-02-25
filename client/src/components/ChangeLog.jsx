import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { Boxes, FileJson, Book } from "lucide-react";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

const ChangeLog = ({ activeFilters }) => {
  const [changeData, setChangeData] = useState({ formats: [], definitions: [] });
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/changes`);
        if (data.formats && data.definitions) {
          setChangeData({
            formats: data.formats,
            definitions: data.definitions,
          });
        }
      } catch (error) {
        console.error("Error fetching change log:", error);
        enqueueSnackbar("Error fetching change log", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchChangeLog();
  }, []);

  // Combine and filter logs based on active filters
  const combinedLogs = useMemo(() => {
    let logs = [
      ...(changeData.formats || []).map((item) => ({ ...item, category: "format" })),
      ...(changeData.definitions || []).map((item) => ({ ...item, category: "definition" })),
    ];
    // Sort newest first
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Filter out logs based on activeFilters
    if (!activeFilters.definitions) {
      logs = logs.filter((log) => log.category !== "definition");
    }
    if (!activeFilters.formats) {
      logs = logs.filter((log) => log.category !== "format");
    }
    return logs;
  }, [changeData, activeFilters]);

  const handleItemClick = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLog(null);
  };

  const renderChangeLogList = () => {
    if (!combinedLogs.length) {
      return <Typography>{t("change_log_empty")}</Typography>;
    }

    return (
      <List sx={{ overflow: "auto" }}>
        {combinedLogs.map((log, index) => {
          const { name, timestamp, before, after, userName, category } = log;
          const changeType =
            before === "" ? "created" : after === "" ? "deleted" : "updated";
          const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
          const primaryText = `${userName || t("admin")} ${t(changeType)} ${name}`;

          return (
            <ListItemButton
              key={index}
              onClick={() => handleItemClick(log)}
              sx={{
                borderRadius: 1,
                mb: 1,
                backgroundColor: theme.palette.background.default,
                "&:hover": {
                  backgroundColor: theme.palette.custom.light,
                },
              }}
            >
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                // p: 1,
                // borderRadius: 1,
              }}>
                {category === "format" ? (
                  <FileJson size={16} />
                ) : category === "definition" ? (
                  <Book size={16} />
                ) : category === "entity" ? (
                  <Boxes size={16} />
                ) : null}
                <ListItemText primary={primaryText} secondary={timeAgo} />
              </Box>
            </ListItemButton>
          );
        })}
      </List>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6">{t("change_log")}</Typography>
        <Divider sx={{ my: 1 }} />
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {t("change_log")}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", height: "92.5%" }}>
        {renderChangeLogList()}
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedLog ? `${t("details_for")} ${selectedLog.name}` : t("change_details")}
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {`${t("timestamp")}: ${new Date(selectedLog.timestamp).toLocaleString()}`}
              </Typography>
              {selectedLog.before && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="error" fontWeight="bold">
                    {t("before")}:
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      p: 1,
                      borderRadius: 1,
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      fontSize: "0.875rem",
                    }}
                  >
                    {JSON.stringify(selectedLog.before, null, 2)}
                  </Box>
                </Box>
              )}
              {selectedLog.after && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {t("after")}:
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      p: 1,
                      borderRadius: 1,
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      fontSize: "0.875rem",
                    }}
                  >
                    {JSON.stringify(selectedLog.after, null, 2)}
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("close")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChangeLog;
