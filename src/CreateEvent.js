import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import EventNoteIcon from '@mui/icons-material/EventNote';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import DatePicker from '@mui/lab/DatePicker';

export default function CreateEvent(props) {
  const [value, setValue] = React.useState(new Date());
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
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
                value={value}
                onChange={(newValue) => {
                  setValue(newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
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