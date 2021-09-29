import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import EventNoteIcon from '@mui/icons-material/EventNote';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import DatePicker from '@mui/lab/DatePicker';
import {v1 as uuid} from 'uuid'; 

export default function CreateEvent(props) {
  const [eventDate, setEventDate] = React.useState(new Date());

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console
    console.log({
      id: uuid(),
      type: data.get('eventType'),
      date: data.get('eventDate'),
      product: data.get('product'),
      description: data.get('description')
    });

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        { 
          id: uuid(),
          type: data.get('eventType'),
          date: data.get('eventDate'),
          product: data.get('product'),
          description: data.get('description')
        })
    };
    fetch('/events', requestOptions);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <EventNoteIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          New Event
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                disableFuture
                label="Occurred on"
                openTo="year"
                views={['year', 'month', 'day']}
                value={eventDate}
                onChange={(newValue) => {
                  setEventDate(newValue);
                }}
                renderInput={(params) => 
                  <TextField {...params} id="eventDate" name="eventDate" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="eventType"
                label="Type"
                name="eventType"
                autoComplete="eventType"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="product"
                label="Product"
                name="product"
                autoComplete="product"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="description"
                label="Description"
                id="description"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Create Event
          </Button>
        </Box>
      </Box>
    </Container>
  );
}