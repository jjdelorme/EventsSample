import React, { useState, useEffect } from 'react';
import { Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { HubConnectionBuilder } from "@microsoft/signalr";  

export default function NewEventNotification() {
  const hubUrl = '/notifyhub'
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hub] = useState(new HubConnectionBuilder()
    .withUrl(hubUrl)
    .build()
  );

  useEffect(() => {
    hub.start()
        .then(() => console.log('Connection started.'))
        .catch(err => console.log('Connection error', err));

    hub.on('newEventMessage', (data) => {
        console.log('message', data);
        setMessage(data);
        setOpen(true);
    });
  }, [hub]); // This tells useEffect to run only if hub changes (which it will never)

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