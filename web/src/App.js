import React, { useState, useCallback } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Dashboard from './Dashboard';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Login from './Login';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddUser from './AddUser';

const mdTheme = createTheme();

function App(props) { 
  const [eventAlerts, setAlerts] = useState(0);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  
  const handleMenuClose = () => { 
    setAnchorEl(null);
    setMenuOpen(false); 
  }

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget);  
    setMenuOpen(true); 
  }

  const handleAddUser = () => {
    handleMenuClose();
    setAddUserOpen(true);
  }

  const handleCloseAddUser = () => {
      setAddUserOpen(false);
  }

  const cbSetAlerts = useCallback(() => {
    setAlerts(count => count ? count + 1 : 1);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <MuiAppBar position="absolute">
                <Toolbar
                    sx={{
                    pr: '24px', 
                    }}>
                     <IconButton onClick={openMenu} edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        id="main-menu"
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleMenuClose}
                        MenuListProps={{
                        'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem disabled={user == null || !user.isAdmin} onClick={handleAddUser}>Add User</MenuItem>
                    </Menu>                    
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{ flexGrow: 1 }}>
                        Dashboard
                    </Typography>
                    <IconButton color="inherit" onClick={() => setAlerts(0)}>
                        <Badge badgeContent={eventAlerts} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <Login setUser={setUser} />
                </Toolbar>
                </MuiAppBar>        
                <AddUser onClose={handleCloseAddUser} open={addUserOpen} user={user} />
                <Dashboard user={user} setAlerts={cbSetAlerts} />
            </Box>
        </ThemeProvider>            
    </LocalizationProvider>
  );
}

export default App;