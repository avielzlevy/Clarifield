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
  ClickAwayListener
} from '@mui/material';
import { X, AlertCircle, ShieldAlert } from 'lucide-react';
import { useDefinitions } from '../contexts/useDefinitions';
import { useFormats } from '../contexts/useFormats';

export default function Problems() {
  const [isOpen, setIsOpen] = useState(false);
  const { definitions } = useDefinitions();
  const { formats } = useFormats();

  // Build a problems map where the key is the missing format and the value is an array of definition keys
  const problems = useMemo(() => {
    const problemsMap = {};

    Object.entries(definitions).forEach(([field, defObj]) => {
      const { format } = defObj;
      // If the format is not defined in formats, then it's a problem
      if (!formats[format]) {
        if (!problemsMap[format]) {
          problemsMap[format] = [];
        }
        problemsMap[format].push(field);
      }
    });

    // Convert the problemsMap into an array of objects for rendering
    return Object.entries(problemsMap).map(([format, defs]) => ({
      format,
      definitions: defs
    }));
  }, [definitions, formats]);

  const totalDefinitions = useMemo(() => {
    return problems.reduce((count, problem) => count + problem.definitions.length, 0);
  }, [problems]);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Notification Bell */}
      <IconButton onClick={() => setIsOpen(!isOpen)} aria-label="Toggle problems menu" disabled={totalDefinitions === 0}>
        <Badge badgeContent={totalDefinitions} color="error" invisible={totalDefinitions === 0}>
          <ShieldAlert size={24} color={totalDefinitions > 0 ? 'black' : 'white'} />
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
            <Box sx={{ bgcolor: 'error.main', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                {totalDefinitions} definition{totalDefinitions !== 1 ? 's' : ''} need{totalDefinitions === 1 ? 's' : ''} attention
              </Typography>
            </Box>

            {/* List of Problems */}
            <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {problems.map((problem, index) => (
                <React.Fragment key={problem.format}>
                  <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    {/* Format Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%' }} />
                        <Typography variant="body1" fontWeight={500}>{problem.format}</Typography>
                      </Box>
                    </Box>

                    {/* Definitions */}
                    {problem.definitions.map((def) => (
                      <ListItemText
                        key={def}
                        primary={def}
                        slotProps={{
                          primary: {
                            variant: 'body2',
                            color: 'text.secondary',
                            sx: { pl: 3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }
                          }
                        }}
                      />
                    ))}
                  </ListItem>
                  {index < problems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {/* Footer */}
            <Box sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Review and update the format definitions to resolve these issues
              </Typography>
            </Box>
          </Paper>
        </ClickAwayListener>
      )}
    </Box>
  );
}
