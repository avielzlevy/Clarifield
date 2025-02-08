import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { ImportContacts, TextFields, Person, ExitToApp, DeviceHub, Settings as SettingIcon, DataObject } from '@mui/icons-material';
import ThemeSwitch from './ThemeSwitch';
import LangDropdown from './LangDropdown';
import { usePage } from '../contexts/PageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Entities from '../pages/Entities';
import Definitions from '../pages/Definitions';
import Formats from '../pages/Formats';
import SignIn from '../pages/SignIn';
import AdminHome from '../pages/AdminHome';
import ViewerHome from '../pages/ViewerHome';
import Validation from '../pages/Validation';
import Settings from '../pages/Settings';
import Analytics from '../pages/Analytics';
import Logs from '../pages/Logs';
import { useTranslation } from 'react-i18next';
import { useRtl } from '../contexts/RtlContext';
function PageContent() {
  const { page } = usePage();
  const { logout,login, auth } = useAuth();
  const token = localStorage.getItem('token');
  if (token)
    axios.get(`${process.env.REACT_APP_API_URL}/api/token/verify`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        login(token);
      })
      .catch(() => {
        logout({mode:'bad_token'});
      });
  return (
    <Box component="main">
      {page === 'home' ?
        auth === true ? <AdminHome /> : <ViewerHome />
        : page === 'entities' ? (
          <Entities />
        ) : page === 'definitions' ? (
          <Definitions />
        ) : page === 'validation' ? (
          <Validation />
        ) : page === 'formats' ? (
          <Formats />
        ) : page === 'signin' ? (
          <SignIn />
        ) : page === 'settings' ? (
          <Settings />
        ) : page === 'analytics' ? (
          <Analytics />
        ) : page === 'logs' ? (
          <Logs />
        ) : (<div>Page Not Found</div>)}
    </Box>
  );
}


const drawerWidth = 240;

function NavBar(props) {
  const { theme, setTheme } = props;
  const { page,setPage } = usePage();
  const { auth,logout } = useAuth();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Viewer';
  const { t } = useTranslation();
  const { rtl, rtlLoading } = useRtl();

  const handleChangeUser = () => {
    if (token) {
      axios.post('/api/token/verify', { token })
        .then(() => {
          setPage('home');
        })
        .catch(() => {
          localStorage.setItem('previousPage', page);
          setPage('signin');
          logout({ mode: 'bad_token' });
        });
    } else {
      localStorage.setItem('previousPage', page);
      setPage('signin');
    }
  };

  const handleSignOut = () => {
    logout({ mode: 'logout' });
  };

  const drawerItems = [
    { text: 'entities', icon: <DataObject />, route: 'entities' },
    { text: 'definitions', icon: <ImportContacts />, route: 'definitions' },
    { text: 'formats', icon: <TextFields />, route: 'formats' },
    { text: 'validation', icon: <DeviceHub />, route: 'validation' },
  ];
  if (auth === true) {
    drawerItems.push({ text: 'settings', icon: <SettingIcon />, route: 'settings' });
    drawerItems.push({ text: 'analytics', icon: <SettingIcon />, route: 'analytics' });
    drawerItems.push({ text: 'logs', icon: <SettingIcon />, route: 'logs' });
  }

  return (
    <Box dir={rtl ? 'rtl' : 'ltr'} sx={{
      display: 'flex',
    }}>
      {rtlLoading === true && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light blur overlay
            backdropFilter: 'blur(5px)', // Apply blur
            zIndex: 9999, // Ensure it's above everything
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>

          <Typography variant="h6" noWrap component="div" sx={{
            '&:hover': {
              cursor: 'pointer',
            },
          }}
            onClick={() => setPage('home')}
          >
            {t('app_name')}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <LangDropdown />
          <ThemeSwitch theme={theme} setTheme={setTheme} />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left">
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 64,
        }}>
          <Tooltip title={username === 'Viewer' ? t('viewer') : t('admin')}>
            <IconButton color="inherit" onClick={handleChangeUser}>
              <Avatar>
                <Person />
              </Avatar>
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            {username === 'Viewer' ? t('viewer') : t('admin')}
          </Typography>
          {auth === true ? <IconButton color="inherit" onClick={handleSignOut} >
            <Avatar>
              <ExitToApp />
            </Avatar>
          </IconButton> : null}
        </Box>
        <Divider />
        <List>
          {drawerItems.map((item, index) => (
            <ListItemButton key={index} onClick={() => setPage(item.route)} sx={{
              '&.hover': {
                backgroundColor: 'primary.main',
                cursor: 'block'
              },
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>

              <ListItemIcon sx={{ ml: '10%' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.text)} />
            </ListItemButton >
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 1 }}
      >
        <Toolbar />
        <PageContent />
      </Box>
    </Box>
  );
}

export default NavBar;
