import React from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DataObjectIcon from '@mui/icons-material/DataObject';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';

const ICON_SIZE = { width: 10, height: 10 };

function EntityCard({ data }) {
  const { auth } = useAuth();
  const theme = useTheme();
  const capitalizedLabel = data.label.charAt(0).toUpperCase() + data.label.slice(1);

  return (
    <Box
      onMouseEnter={data.onMouseEnter}
      sx={{
        position: 'relative',
        '&:hover .toolbar': { opacity: 1 },
        '&:hover': { cursor: 'pointer' },
      }}
    >
      {/* Toolbar: Appears on hover */}
      <Box
        className="toolbar"
        sx={{
          position: 'absolute',
          top: -7.5,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 7.5,
          opacity: 0,
          transition: 'opacity 0.3s',
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex' }}>
          {auth && (
            <IconButton sx={ICON_SIZE} onClick={data.onEdit}>
              <EditIcon sx={ICON_SIZE} />
            </IconButton>
          )}
          <IconButton sx={ICON_SIZE} onClick={data.onCopy}>
            <ContentCopyIcon sx={ICON_SIZE} />
          </IconButton>
        </Box>
        {auth && (
          <IconButton sx={ICON_SIZE} onClick={data.onDelete}>
            <DeleteIcon sx={ICON_SIZE} />
          </IconButton>
        )}
      </Box>

      {/* Main Paper Content */}
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 0,
          width: 'auto',
          border: `1px solid ${theme.palette.custom.light}`,
          borderRadius: 2,
        }}
      >
        <List
          component="nav"
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.3,
            mx: '10px',
            minWidth: '5.25vw',
          }}
          subheader={
            <ListSubheader
              component="div"
              sx={{
                backgroundColor: 'transparent',
                color: theme.palette.custom.bright,
                textAlign: 'center',
                zIndex: 1,
                p: 0,
                lineHeight: 1,
                fontSize: 10,
                fontWeight: 'bold',
                mt: 1,
                mb: 1,
              }}
            >
              {capitalizedLabel}
            </ListSubheader>
          }
        >
          {data.fields &&
            data.fields.map((field, index) => (
              <ListItem
                key={index}
                onClick={field.type === 'entity' ? () => data.onEntityClick(field.label) : undefined}
                sx={{
                  backgroundColor:
                    theme.palette.mode === 'light'
                      ? theme.palette.custom.light
                      : theme.palette.background.paper,
                  borderRadius: 2,
                  height: '3vh',
                }}
              >
                {field.type === 'entity' && <DataObjectIcon sx={ICON_SIZE} />}
                <ListItemText
                  primary={field.label}
                  slotProps={{ primary: { sx: { fontSize: 10 } } }}
                  sx={{ textAlign: 'center',mx: 0.5 }}
                />
              </ListItem>
            ))}
        </List>
      </Paper>
    </Box>
  );
}

export default EntityCard;
