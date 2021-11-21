import React, { useState, useEffect } from 'react';
import { Snackbar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";  

function createHub() {
  console.log('Creating hub...');
  const hubUrl = '/notifyhub'
  const hub = new HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build()

  if (hub.state === HubConnectionState.Disconnected) {
    hub.start()
      .then(() => console.log('Connection started.'))
      .catch(err => console.log('Connection error', err));
  }

  return hub;
}

export default function NewEventNotification(props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const onNewEvent = props.onNewEvent;

  useEffect(() => {
    const hub = createHub();
    
    const onNewMessage = (data) => {
      console.log('newEventMessage', data);
      const eventItem = JSON.parse(data);
  
      if (eventItem.id != null) {
          setMessage(eventItem.type);
          setOpen(true);
          onNewEvent(eventItem);
      }
    };    

    hub.on('newEventMessage', (data) => {
      onNewMessage(data);
    });
  }, [onNewEvent]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const actionButton = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={"New " + message + " event"}
        action={actionButton}
      />
    </div>
  );
}