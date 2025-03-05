import { Box, CircularProgress } from '@mui/material'

import React from 'react'

function Loading() {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
        }}>
            <CircularProgress />
        </Box>
    )
}

export default Loading