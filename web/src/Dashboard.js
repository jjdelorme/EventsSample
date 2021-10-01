import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Events from './Events';
import CreateEvent from './CreateEvent';
import NewEventNotification from './NewEventNotification';

const mdTheme = createTheme();

function Version(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Version ' + process.env.REACT_APP_VERSION} - {process.env.NODE_ENV}
    </Typography>
  );
}

function DashboardContent() {

  const [eventItems, setEvents] = useState([]);
  const [eventAlerts, setAlerts] = useState(null);

  const onNewEvent = (e) => {
    setEvents(events => [...events, e]);
    setAlerts(count => count ? count + 1 : 1);
  };

  const onDeletedEvent = (id) => {
    setEvents(events => {
      const newEvents = events.filter((e) => e.id !== id);
      return newEvents;
    });
  };

  useEffect(() => {
    // Load events.
    const eventsUrl = '/events';
    fetch(eventsUrl)
      .then(response => response.json())
      .then(data => {
        if (data != null)
          setEvents(data);
        else
          setEvents([]);
      }); 
  }, []);

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <MuiAppBar position="absolute">
          <Toolbar
            sx={{
              pr: '24px', 
            }}
          >
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Dashboard
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={eventAlerts} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </MuiAppBar>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <CreateEvent />
          <NewEventNotification onNewEvent={onNewEvent} />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Recent Events */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Events events={eventItems} onDeletedEvent={onDeletedEvent} />
                </Paper>
              </Grid>
            </Grid>
            <Version sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}