import React, { PropsWithChildren, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, CssBaseline, Drawer, List, ListItemButton, ListItemText, Divider, useMediaQuery, Tooltip, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link as RouterLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export interface LayoutProps extends PropsWithChildren {
  onToggleMode: () => void;
  mode: 'light' | 'dark';
}
const drawerWidth = 230;

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'People', to: '/persons' },
  { label: 'Departments', to: '/departments' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Org Chart', to: '/org-chart' },
];


export const Layout: React.FC<LayoutProps> = ({ children, onToggleMode, mode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isSmall = useMediaQuery('(max-width:900px)');
  const { handleLogout, user } = useAuth();
  const navigate = useNavigate();

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map(item => (
          <ListItemButton key={item.to} component={RouterLink} to={item.to} selected={location.pathname === item.to} onClick={() => setMobileOpen(false)}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isSmall && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(p => !p)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Org Chart C++ app demo for IAI Neusphere program
          </Typography>
          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton color="inherit" onClick={onToggleMode} sx={{ mr: 1 }}>
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
          {user && (
            <Tooltip title="Logout">
              <Button
                variant={mode === 'light' ? 'outlined' : 'contained'}
                color="error"
                onClick={onLogout}
                startIcon={<AccountCircle />}
                sx={{
                  ml: 1,
                  fontWeight: 600,
                  borderColor: mode === 'light' ? 'error.main' : undefined,
                  color: mode === 'light' ? 'error.main' : 'white',
                  bgcolor: mode === 'light' ? '#fff' : undefined,
                  '&:hover': {
                    bgcolor: mode === 'light' ? '#ffeaea' : 'error.dark',
                    borderColor: mode === 'light' ? 'error.dark' : undefined,
                  },
                }}
              >
                Logout
              </Button>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant={isSmall ? 'temporary' : 'permanent'} open={isSmall ? mobileOpen : true} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {children}
        <Outlet />
      </Box>
    </Box>
  );
};
