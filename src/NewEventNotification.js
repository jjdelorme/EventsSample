import React, { useState, useEffect } from 'react';
//import { Snackbar } from '@mui/material';
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
  }, [hub]);

  return (
      <div>
          Message is: {message}
      </div>
  )
}