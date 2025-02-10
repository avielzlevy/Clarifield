import React from 'react'
import {IconButton,ToggleButtonGroup} from '@mui/material';
import {LightModeOutlined as LightMode,DarkModeOutlined as DarkMode} from '@mui/icons-material';
import darkTheme from '../themes/darkTheme';
import lightTheme from '../themes/lightTheme';



function ThemeButton(props) {
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
        <IconButton disableRipple>
            {theme.palette.mode === 'dark' ? <LightMode sx={{color:'#FFD242'}} onClick={() => changeTheme('light')}/> : <DarkMode sx={{color:'black'}} onClick={() => changeTheme('dark')}/>}
        </IconButton>
    )
}

export default ThemeButton