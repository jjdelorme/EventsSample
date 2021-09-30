import React, { useState, useEffect } from 'react';
import { Snackbar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";  

export default function NewEventNotification(props) {
  const hubUrl = '/notifyhub'
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hub] = useState(new HubConnectionBuilder()
    .withUrl(hubUrl)
    .build());
  const onNewEvent = props.onNewEvent;

  useEffect(() => {
    if (hub.state === HubConnectionState.Disconnected) {
      hub.start()
          .then(() => console.log('Connection started.'))
          .catch(err => console.log('Connection error', err));

      hub.on('newEventMessage', (data) => {
          console.log('newEventMessage', data);
          const eventItem = JSON.parse(data);
          if (eventItem.id != null) {
              setMessage(eventItem.type);
              setOpen(true);
              onNewEvent(eventItem);
          }
      });
    }
  }, [hub, onNewEvent]); // This tells useEffect to run only if these params change

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const action = (
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
        autoHideDuration={30000}
        onClose={handleClose}
        message={"New " + message + " event"}
        action={action}
      />
    </div>
  );
}