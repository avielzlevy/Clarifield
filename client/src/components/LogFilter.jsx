import React, { useState } from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

function LogFilter(props) {
    const { logs, label } = props
    const [options, setOptions] = useState(() => {
        const logSet = new Set(logs)
        return [...logSet]
    })
    return (
        <>
            {label === 'Timestamp' ? <DateTimePicker label="name" name="startDateTime" />
                : <Autocomplete
                    size='small'
                    disablePortal
                    options={options}
                    // sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label={label} sx={{
                        height: '20px',
                    }} />}
                />}
        </>
    )
}

export default LogFilter