import React, { useState, useMemo } from 'react';
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
  ListItemIcon
} from '@mui/material';
import { X, AlertCircle, ShieldAlert,Boxes,Book } from 'lucide-react';
import { useDefinitions } from '../contexts/useDefinitions';
import { useFormats } from '../contexts/useFormats';
import { useEntities } from '../contexts/useEntities';
import { useTheme } from '@mui/material/styles';

export default function Problems() {
  const [isOpen, setIsOpen] = useState(false);
  const { formats } = useFormats();
  const { definitions } = useDefinitions();
  const { entities } = useEntities();
  const theme = useTheme();

  // Combine two checks:
  // 1. Definitions referencing missing formats.
  // 2. Entities referencing missing definitions or entities.
  const problems = useMemo(() => {
    const problemsList = [];

    // Check for definitions that use a format which is not defined.
    Object.entries(definitions).forEach(([defKey, defObj]) => {
      const { format } = defObj;
      if (!formats[format]) {
        problemsList.push({
          type: 'definition-format',
          message: `Definition '${defKey}' uses missing format '${format}'.`
        });
      }
    });

    // Check entity references.
    Object.entries(entities).forEach(([entityKey, entity]) => {
      entity.fields.forEach(field => {
        if (field.type === 'definition' && !definitions[field.label]) {
          problemsList.push({
            type: 'entity-reference',
            message: `Entity '${entityKey}' references missing definition '${field.label}'.`
          });
        } else if (field.type === 'entity' && !entities[field.label]) {
          problemsList.push({
            type: 'entity-reference',
            message: `Entity '${entityKey}' references missing entity '${field.label}'.`
          });
        }
      });
    });

    return problemsList;
  }, [definitions, formats, entities]);

  const totalProblems = problems.length;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Notification Bell */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle problems menu"
        disabled={totalProblems === 0}
      >
        <Badge badgeContent={totalProblems} color="error" invisible={totalProblems === 0}>
          <ShieldAlert size={24} color={totalProblems > 0 ? 'black' : 'white'} />
        </Badge>
      </IconButton>

      {/* Dropdown Menu */}
      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              right: 0,
              mt: 1,
              width: 'auto',
              zIndex: 10,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertCircle size={24} />
                <Typography variant="h6">Problems</Typography>
              </Box>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                <X size={20} />
              </IconButton>
            </Box>

            {/* Description */}
            <Box sx={{ p: 2, bgcolor: 'error.light' }}>
              <Typography variant="body2" color="white">
                {totalProblems} problem{totalProblems !== 1 ? 's' : ''} need{totalProblems === 1 ? 's' : ''} attention
              </Typography>
            </Box>

            {/* List of Problems */}
            <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {problems.map((problem, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{
                    display: 'flex',
                    // gap: 1,
                  }}>
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      {problem.type === 'definition-format' ? 
                      <Book color={theme.palette.custom.bright}/> :
                       problem.type === 'entity-reference' ? 
                       <Boxes color={theme.palette.custom.bright}/> : null}
                    </ListItemIcon>
                    <ListItemText
                      primary={problem.message}
                      slotProps={{
                        primary: {
                          variant: 'body2',
                          color: 'text.secondary',
                          sx: {
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }
                        }
                      }}
                    />
                  </ListItem>
                  {index < problems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {/* Footer */}
            <Box sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Review and update your definitions, formats, and entity references to resolve these issues.
              </Typography>
            </Box>
          </Paper>
        </ClickAwayListener>
      )}
    </Box>
  );
}
