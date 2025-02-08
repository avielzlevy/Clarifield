
import {
    Paper,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    IconButton,
    Box
} from '@mui/material';
import React from 'react';
import DataObjectIcon from '@mui/icons-material/DataObject';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

function EntityCard(node) {
    const { data } = node;
    const { auth } = useAuth();
    const theme = useTheme();

    return (
        <Box
            onMouseEnter={() => data.onMouseEnter && data.onMouseEnter()}
            sx={{
                position: 'relative', // anchor absolute children properly
                '&:hover .toolbar': {
                    opacity: 1,
                },
                '&:hover': {
                    cursor: 'pointer',
                },
                width: 100,
            }}
        >
            {/* Toolbar: Appears above the Paper on hover */}
            <Box className="toolbar" sx={{
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
            }}>
                <Box
                    sx={{
                        display: 'flex',
                        // gap: 1,
                    }}
                >   
                    {auth === true && <IconButton sx={{ height: 10, width: 10 }} onClick={data.onEdit}>
                        <EditIcon sx={{ height: 10, width: 10 }} />
                    </IconButton>}
                    <IconButton sx={{ height: 10, width: 10 }} onClick={data.onCopy}>
                        <ContentCopyIcon sx={{ height: 10, width: 10 }} />
                    </IconButton>
                </Box>
                {auth === true &&
                    <IconButton sx={{ height: 10, width: 10 }} onClick={data.onDelete}>
                        <DeleteIcon sx={{ height: 10, width: 10 }} />
                    </IconButton>}
            </Box>

            {/* Main Paper Content */}
            <Paper
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 0.5,
                }}
            >
                <List
                    sx={{
                        width: '100%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.3,
                    }}
                    component="nav"
                    aria-labelledby="subheader"
                    subheader={
                        <ListSubheader
                            component="div"
                            id="subheader"
                            sx={{
                                textAlign: 'center',
                                zIndex: 1,
                                padding: 0,
                                lineHeight: 1,
                                fontSize: 10,
                                fontWeight: 'bold',
                            }}
                        >
                            {data.label.charAt(0).toUpperCase() + data.label.slice(1)}
                        </ListSubheader>
                    }
                >
                    {data.fields && data.fields.map((field, index) => (
                        <ListItem
                            key={index}
                            onClick={field.type === 'entity' ? () => data.onEntityClick(field.label) : undefined}
                            sx={{
                                width: '90%',
                                backgroundColor:
                                    theme.palette.background.paper !== '#fff'
                                        ? '#272727'
                                        : '#e9e9e9',
                                padding: 0,
                            }}
                        >
                            {field.type === 'entity' && <DataObjectIcon sx={{ height: 10, width: 10 }} />}
                            <ListItemText
                                slotProps={{ primary: { sx: { fontSize: 10 } } }}
                                primary={field.label}
                                sx={{ textAlign: 'center' }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}

export default EntityCard;
