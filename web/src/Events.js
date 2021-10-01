import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Title from './Title';

function preventDefault(event) {
  event.preventDefault();
}

export default function Events(props) {
  const events = props.events;
  const onDeleted = props.onDeletedEvent;

  const deleteEvent = (id) => {
    console.log('deleting event', id);
    const requestOptions = {
      method: 'DELETE'
    };
    fetch('/events/' + id, requestOptions);  
    
    if (onDeleted != null)
      onDeleted(id);
  }

  return (
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
              <IconButton onClick={() => deleteEvent(row.id)} aria-label="delete">
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