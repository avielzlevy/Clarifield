import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";

const ChangeLog = ({ changeLog, loadingChangeLog }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const theme = useTheme();
  const { t } = useTranslation();

  if (loadingChangeLog) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6">{t("change_log")}</Typography>
        <Divider sx={{ my: 1 }} />
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Combine the two arrays into one, tagging each entry
   * so we know whether it's a "format" or "definition".
   */
  const combinedLogs = [
    ...(changeLog.formats || []).map(item => ({ ...item, category: "format" })),
    ...(changeLog.definitions || []).map(item => ({ ...item, category: "definition" }))
  ];

  // Sort newest first
  combinedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Handle click to open dialog
  const handleItemClick = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLog(null);
  };

  // Render a single combined list
  const renderChangeLogList = () => {
    if (!combinedLogs.length) {
      return <Typography>{t("change_log_empty")}</Typography>;
    }

    return (
      <List sx={{
        overflow: "auto",
      }}>
        {combinedLogs.map((log, index) => {
          const { name, timestamp, before, after, type, userName, category } = log;
          const changeType =
            before === "" ? "created" : after === "" ? "deleted" : "updated";

          // e.g., "John Doe updated Customer schema 2 hours ago"
          // prefix with [Format] or [Definition]
          const categoryLabel = category === "format" ? t("Format") : t("Definition");
          const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
          const primaryText = `[${categoryLabel}] ${userName || t("admin")} ${t(changeType)} ${name}`;
          const secondaryText = timeAgo;

          return (
            <ListItemButton
              key={index}
              onClick={() => handleItemClick(log)}
              sx={{
                borderRadius: 1,
                mb: 1,
                backgroundColor: theme.palette.background.default,
                '&:hover': {
                  backgroundColor: theme.palette.custom.light
                }
              }}
            >
              <ListItemText
                primary={primaryText}
                secondary={secondaryText}
              />
            </ListItemButton>
          );
        })}
      </List>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {t("change_log")}
        </Typography>
      </Box>

      {/* Main list area */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "92.5%",
          // backgroundColor: theme.palette.background.default,
          borderRadius: 2,
          // p: 2
        }}
      >
        {renderChangeLogList()}
      </Box>

      {/* Dialog to show the selected log's details */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedLog
            ? `${t("details_for")} ${selectedLog.name}`
            : t("change_details")}
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <>
              {/* Timestamp */}
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {`${t("timestamp")}: ${new Date(selectedLog.timestamp).toLocaleString()}`}
              </Typography>

              {/* BEFORE */}
              {selectedLog.before && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="error" fontWeight="bold">
                    {t("before")}:
                  </Typography>
                  <Box
                    component="pre"
                    dir="ltr"
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      p: 1,
                      borderRadius: 1,
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      fontSize: "0.875rem"
                    }}
                  >
                    {JSON.stringify(selectedLog.before, null, 2)}
                  </Box>
                </Box>
              )}

              {/* AFTER */}
              {selectedLog.after && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {t("after")}:
                  </Typography>
                  <Box
                    component="pre"
                    dir="ltr"
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      p: 1,
                      borderRadius: 1,
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      fontSize: "0.875rem"
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
