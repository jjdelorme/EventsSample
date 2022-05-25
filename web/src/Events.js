import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Title from './Title';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import { deleteEventRequest } from './eventService';

export default function Events(props) {
  const events = props.events;
  const onDeleted = props.onDeletedEvent;
  const user = props.user;
  const loggedIn = user != null;
  const cbUserExpired = props.onUserExpired;
  const setError = props.setError;

  const deleteEvent = (id) => {
    console.log('deleting event', id);
    
    if (!loggedIn) {
      setError('Must be logged in to delete event.');
      return;
    }
    
    deleteEventRequest(user, id)
    .then((response) => {
      if (response.ok) {
        if (onDeleted != null)
          onDeleted(id);
      } else {
        if (response.status === 401 && loggedIn) {
          cbUserExpired();
          setError("User session expired, please login again.");
        }
        else 
          setError(`Unable to delete event: ${response.statusText}.`);
      }
    }).catch((error) => {
      setError(`Unexpected error: ${error}`);
    });
  }

  return (
    <Grid container spacing={3}>
    {/* Recent Events */}
    <Grid item xs={12}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <React.Fragment>
          <Title>Recent Events</Title>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Event Type</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Description</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>
                  <IconButton disabled={!loggedIn} onClick={() => deleteEvent(row.id)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>                
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </React.Fragment>
        </Paper>
      </Grid>
    </Grid>    
  );
}