import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning';

function ChangeWarning({ items,level }) {
    const tooltipText = Object.entries(items).map(([key, values]) => {
        return `${key}:\n${values.map(v => `- ${v}`).join('\n')}`;
      }).join('\n\n');
      
    
    return (
        <>
        <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>The following items will {level==='warning' ? 'be affected' : 'break'} by this change:{'\n'}{tooltipText}</span>}>
            <IconButton color={level === 'warning' ? 'warning' : 'error'} aria-label="warning"> 
                <WarningIcon />
            </IconButton>
        </Tooltip>
        </>
    )
}

export default ChangeWarning