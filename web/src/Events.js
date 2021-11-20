import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Title from './Title';
import Error from './Error';
import { deleteEventRequest } from './eventService';

export default function Events(props) {
  const [error, setError] = useState(null);
  const events = props.events;
  const onDeleted = props.onDeletedEvent;
  const user = props.user;
  const loggedIn = user != null;

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
        setError(`Unable to delete event: ${response.statusText}.`);
      }
    }).catch((error) => {
      setError(`Unexpected error: ${error}`);
    });
  }

  const handleErrorClose = () => {
    setError(null);
  }

  return (
    <React.Fragment>
      <Error message={error} onErrorClose={handleErrorClose} />
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
  );
}