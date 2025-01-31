import React from 'react'
import {ToggleButton,ToggleButtonGroup} from '@mui/material';
import {LightMode,DarkMode} from '@mui/icons-material';
import darkTheme from '../themes/darkTheme';
import lightTheme from '../themes/lightTheme';



function ThemeSwitch(props) {
    const {theme,setTheme} = props;
    const changeTheme = (theme) => {
        switch (theme) {
            case 'dark':
                setTheme(darkTheme);
                localStorage.setItem('darkMode', 'true');
                break;
            case 'light':
                setTheme(lightTheme);
                localStorage.setItem('darkMode', 'false');
                break;
            default:
                break;
        }
    }
    return (
        <ToggleButtonGroup
            // color="primary"
            value={theme.palette.mode}
            exclusive
            onChange={(event, value) => {
                changeTheme(value);
            }}
            aria-label="Platform"
        >
            <ToggleButton value="dark"><DarkMode sx={{color:'black'}}/></ToggleButton>
            <ToggleButton value="light"><LightMode sx={{color:'white'}}/></ToggleButton>
        </ToggleButtonGroup>
    )
}

export default ThemeSwitch