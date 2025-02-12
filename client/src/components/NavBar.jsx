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
  Divider,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  ImportContactsOutlined as ImportContacts,
  TextFieldsOutlined as TextFields,
  PersonOutlineOutlined as PersonIcon,
  EngineeringOutlined as EnginnerIcon,
  DeviceHubOutlined as DeviceHub,
  Settings as SettingIcon,
  DataObject,
  SpaceDashboardRounded as DashboardIcon,
  BarChartOutlined as AnalyticsIcon,
  ReceiptOutlined as LogsIcon,
} from '@mui/icons-material';
import ThemeButton from './ThemeSwitch';
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
import SearchAll from './SearchAll';
function PageContent() {
  const { page } = usePage();
  const { logout, login, auth } = useAuth();
  const token = localStorage.getItem('token');
  if (token)
    axios.get(`${process.env.REACT_APP_API_URL}/api/token/verify`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        login(token);
      })
      .catch(() => {
        logout({ mode: 'bad_token' });
      });
  return (
    // <Box component="main" sx={{overflow:'hidden'}}>
    <>
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
    </>
    // </Box>
  );
}


const drawerWidth = 240;

function NavBar(props) {
  const { theme, setTheme } = props;
  const { page, setPage } = usePage();
  const { auth, logout } = useAuth();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Viewer';
  const { t } = useTranslation();
  const { rtl, rtlLoading } = useRtl();

  const handleChangeUser = () => {
    if (token) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/token/verify`, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          logout({ mode: 'logout' });
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

  const drawerItems = [
    { text: 'entities', icon: <DataObject />, route: 'entities' },
    { text: 'definitions', icon: <ImportContacts />, route: 'definitions' },
    { text: 'formats', icon: <TextFields />, route: 'formats' },
    { text: 'validation', icon: <DeviceHub />, route: 'validation' },
  ];
  if (auth === true) {
    drawerItems.push({ text: 'settings', icon: <SettingIcon />, route: 'settings' });
    drawerItems.push({ text: 'analytics', icon: <AnalyticsIcon />, route: 'analytics' });
    drawerItems.push({ text: 'logs', icon: <LogsIcon />, route: 'logs' });
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
        // sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        elevation={0}
      >
        <Toolbar sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <Box sx={{ gap: 1, display: 'flex', alignItems: 'center', ml: 10 }}>
            <DashboardIcon sx={{ color: theme.palette.custom.bright }}
            />
            <Typography variant="h6" noWrap component="div" sx={{
              '&:hover': {
                cursor: 'pointer',
              },
              fontWeight: 'bold',
            }}
              onClick={() => setPage('home')}
            >
              {t('app_name')}
            </Typography>
          </Box>
          <SearchAll />
          <Box sx={{ gap: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tooltip title={username === 'Viewer' ? t('viewer') : t('admin')}>
              <IconButton color="inherit" onClick={handleChangeUser}>
                {auth ? <EnginnerIcon /> : <PersonIcon />}
              </IconButton>
            </Tooltip>
            {/* {auth === true ? <IconButton color="inherit" onClick={handleSignOut} >
            <Avatar>
              <ExitToApp />
            </Avatar>
          </IconButton> : null} */}
            <LangDropdown />
            <ThemeButton theme={theme} setTheme={setTheme} />
          </Box>
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
          justifyContent: 'center',
          alignItems: 'center',
          height: 64,
        }}>
        </Box>
        <Divider />
        <List sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 0.2,
        }}>
          {drawerItems.map((item, index) => (
            <ListItemButton key={index} disableRipple onClick={() => setPage(item.route)}
              sx={{
                '&:hover': {
                  bgcolor: theme.palette.custom.light,
                  cursor: 'pointer',
                },
                color: theme.palette.mode === 'light' ?
                  page === item.route ? theme.palette.custom.bright : undefined
                  : page === item.route ? theme.palette.custom.dark : undefined,
                bgcolor: theme.palette.mode === 'light' ?
                  page === item.route ? theme.palette.custom.light : undefined
                  : page === item.route ? theme.palette.custom.bright : undefined,
                borderRadius: '20px',
                width: '90%',
                justifyContent: 'center',
                alignItems: 'center',

              }}>

              <ListItemIcon sx={{
                color: theme.palette.mode === 'light' ?
                  page === item.route ? theme.palette.custom.bright : undefined
                  : page === item.route ? theme.palette.custom.db : undefined,
                // ml: '10%'
              }}>{item.icon}</ListItemIcon>
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
    </Box >
  );
}

export default NavBar;
