import React, { useState, useMemo, useCallback } from "react";
import {
  IconButton,
  Badge,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  ClickAwayListener,
  ListItemIcon,
} from "@mui/material";
import { X, AlertCircle, ShieldAlert, Boxes, Book } from "lucide-react";
import { useDefinitions } from "../contexts/useDefinitions";
import { useFormats } from "../contexts/useFormats";
import { useEntities } from "../contexts/useEntities";
import { useTheme } from "@mui/material/styles";

export default function Problems() {
  const [isOpen, setIsOpen] = useState(false);
  const { formats } = useFormats();
  const { definitions } = useDefinitions();
  const { entities } = useEntities();
  const theme = useTheme();

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  // Memoized problem list generation
  const problems = useMemo(() => {
    const formatIssues = Object.entries(definitions)
      .filter(([_, def]) => !formats[def.format])
      .map(([key, def]) => ({
        type: "definition-format",
        message: `Definition '${key}' uses missing format '${def.format}'.`,
      }));

    const entityIssues = Object.entries(entities).flatMap(([key, entity]) =>
      entity.fields
        .filter(
          (field) =>
            (field.type === "definition" && !definitions[field.label]) ||
            (field.type === "entity" && !entities[field.label])
        )
        .map((field) => ({
          type: "entity-reference",
          message: `Entity '${key}' references missing ${field.type} '${field.label}'.`,
        }))
    );

    return [...formatIssues, ...entityIssues];
  }, [definitions, formats, entities]);

  const totalProblems = problems.length;

  const getProblemIcon = (type) => {
    switch (type) {
      case "definition-format":
        return <Book color={theme.palette.custom.bright} />;
      case "entity-reference":
        return <Boxes color={theme.palette.custom.bright} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* Notification Badge */}
      <IconButton
        onClick={toggleOpen}
        aria-label="Toggle problems menu"
        disabled={totalProblems === 0}
        color="inherit"
      >
        <Badge badgeContent={totalProblems} color="error" invisible={totalProblems === 0}>
          <ShieldAlert size={24} style={{ 'display': totalProblems > 0 ? "block" : "none" }} />
        </Badge>
      </IconButton>

      {/* Dropdown Menu */}
      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              right: 0,
              mt: 1,
              width: "auto",
              zIndex: 10,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                bgcolor: "error.main",
                color: "white",
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AlertCircle size={24} />
                <Typography variant="h6">Problems</Typography>
              </Box>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "white" }}>
                <X size={20} />
              </IconButton>
            </Box>

            {/* Description */}
            <Box sx={{ p: 2, bgcolor: "error.light" }}>
              <Typography variant="body2" color="white">
                {totalProblems} problem{totalProblems !== 1 ? "s" : ""} need
                {totalProblems === 1 ? "s" : ""} attention
              </Typography>
            </Box>

            {/* List of Problems */}
            <List sx={{ maxHeight: 400, overflowY: "auto" }}>
              {problems.map((problem, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 35 }}>{getProblemIcon(problem.type)}</ListItemIcon>
                    <ListItemText
                      primary={problem.message}
                      slotProps={{
                        primary: {
                          variant: "body2",
                          color: "text.secondary",
                          sx: {
                            overflow: "hidden",
                            whiteSpace:
                              "nowrap",
                            textOverflow: "ellipsis",
                          },
                        }
                      }}
                    />
                  </ListItem>
                  {index < problems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {/* Footer */}
            <Box sx={{ p: 2, bgcolor: "grey.100", textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary">
                Review and update your definitions, formats, and entity references to resolve these
                issues.
              </Typography>
            </Box>
          </Paper>
        </ClickAwayListener>
      )}
    </Box>
  );
}
