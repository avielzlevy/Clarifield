import React from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Boxes,
  Pencil,
  Trash2 as Trash,
  Copy,
  Flag,
} from 'lucide-react';
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
          // left: '50%',
          // transform: 'translateX(-50%)',
          // display: 'flex',
          // justifyContent: 'space-between',
          gap: 7.5,
          opacity: 0,
          transition: 'opacity 0.3s',
          zIndex: 10,
          width: '100%',
        }}
      >
        {auth ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              flexGrow: 1,
              // bgcolor:'red',
              px: 1, // optional padding to space from edges
            }}
          >
            {/* Left side: edit and copy */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Pencil style={ICON_SIZE} onClick={data.onEdit} />
              <Copy style={ICON_SIZE} onClick={data.onCopy} />
            </Box>
            {/* Right side: trash */}
            <Trash style={ICON_SIZE} onClick={data.onDelete} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Copy style={ICON_SIZE} onClick={data.onCopy} />
            <Flag style={ICON_SIZE} onClick={data.onReport} />
          </Box>
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
            width: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.3,
            px: 1,
            
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
                {field.type === 'entity' && <Boxes style={{
                  width: '12px',
                  height: '12px',
                  color: theme.palette.custom.bright,
                }} />}
                <ListItemText
                  primary={field.label}
                  slotProps={{ primary: { sx: { fontSize: 10 } } }}
                  sx={{ textAlign: 'center', mx: 0.5 }}
                />
              </ListItem>
            ))}
        </List>
      </Paper>
    </Box>
  );
}

export default EntityCard;
