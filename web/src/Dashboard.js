import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Events from './Events';
import CreateEvent from './CreateEvent';
import NewEventNotification from './NewEventNotification';
import Version from './Version';
import { loadEvents } from './eventService';

export default function Dashboard(props) {
  const user = props.user;
  const [eventItems, setEvents] = useState([]);
  const setAlerts = props.setAlerts;

  const onNewEvent = useCallback((e) => {
    setEvents(events => [...events, e]);
    setAlerts();
  }, [setAlerts]);

  const onDeletedEvent = (id) => {
    setEvents(events => {
      const newEvents = events.filter((e) => e.id !== id);
      return newEvents;
    });
  };

  useEffect(() => {
    loadEvents()
    .then(data => {
      if (data != null)
        setEvents(data);
      else
        setEvents([]);
    }); 
  }, []);

  return (
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
      <CreateEvent user={user} />
      <NewEventNotification onNewEvent={onNewEvent} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Recent Events */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Events user={user} events={eventItems} onDeletedEvent={onDeletedEvent} />
            </Paper>
          </Grid>
        </Grid>
        <Version sx={{ pt: 4 }} />
      </Container>
    </Box>
  );
}
