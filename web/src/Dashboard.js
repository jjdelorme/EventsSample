import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Events from './Events';
import CreateEvent from './CreateEvent';
import NewEventNotification from './NewEventNotification';
import Version from './Version';
import { loadEvents } from './eventService';
import Error from './Error';

export default function Dashboard(props) {
  const user = props.user;
  const [eventItems, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const setAlerts = props.setAlerts;
  const onUserExpired = props.onUserExpired;

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

  const handleErrorClose = () => {
    setError(null);
  }

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
      <Error message={error} onErrorClose={handleErrorClose} />
      <CreateEvent user={user} onUserExpired={onUserExpired} setError={setError} />
      <NewEventNotification onNewEvent={onNewEvent} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Events user={user} events={eventItems} 
                  onDeletedEvent={onDeletedEvent}
                  onUserExpired={onUserExpired}
                  setError={setError} />
        <Version sx={{ pt: 4 }} />
      </Container>
    </Box>
  );
}
