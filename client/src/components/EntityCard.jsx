
import {
    Paper,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    IconButton,
    Box
} from '@mui/material';
import React, { useEffect } from 'react';
import DataObjectIcon from '@mui/icons-material/DataObject';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTheme } from '@mui/material/styles';

function EntityCard(node) {
    const { data } = node;
    useEffect(() => {
        console.log(node);
    }, [data]);

    
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
            <Box
                className="toolbar"
                sx={{
                    position: 'absolute',
                    left: '15%',
                    top: -7.5,
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    // gap: 1,
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    zIndex: 10,
                }}
            >
                <IconButton sx={{height:10,width:10}} onClick={data.onEdit}>
                    <EditIcon sx={{height:10,width:10}}/>
                </IconButton>
                <IconButton sx={{height:10,width:10}} onClick={data.onCopy}>
                    <ContentCopyIcon sx={{height:10,width:10}}/>
                </IconButton>
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
                            {data.label}
                        </ListSubheader>
                    }
                >
                    {data.fields&&data.fields.map((field, index) => (
                        <ListItem
                            key={index}
                            onClick={field.type==='entity' ? data.onEntityClick : undefined}
                            sx={{
                                width: '90%',
                                backgroundColor:
                                    theme.palette.background.paper !== '#fff'
                                        ? '#272727'
                                        : '#e9e9e9',
                                padding: 0,
                            }}
                        >
                            {field.type==='entity' && <DataObjectIcon sx={{height:10,width:10}} />}
                            <ListItemText
                                slotProps={{ primary: { sx: { fontSize:10 } } }}
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
