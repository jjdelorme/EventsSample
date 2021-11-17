import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import WrappedSnackbar from './WrappedSnackbar';

function error(message) {
  return {
    severity: 'error', 
    message: message 
  }
};

function success(message) {
  return {
    severity: 'success',
    message: message
  }
};

async function requestCreate(email, authToken) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
               'Authorization': 'Bearer ' + authToken 
    },
    body: JSON.stringify(
      { 
        email: email
      })
  };  
  const response = await fetch('/user/create', requestOptions);
  return response;
}

async function saveUser(email, authToken) {
  console.log('saving user', email);

  const response = await requestCreate(email, authToken).catch((err) => {
    return error(`Unexpected error ${err}`);
  });

  if (!response.ok)
    return error(`Server error: ${response.statusText}`);
  else
    return success(`Created user ${email}`);
};

export default function AddUser(props) {
  const { open, onClose, user } = props;
  const [ snackbar, setSnackbar ] = useState(null);
  const [ input, setInput ] = useState({});

  const handleInputChange = (e) => setInput({
    ...input,
    [e.currentTarget.name]: e.currentTarget.value
  })
  
  const onAdd = () => saveUser(input.email, user.authToken).then((result) => {
      console.log('onAdd', result);
      setSnackbar(result);
      onClose();
  });

  const handleSnackbarClose = () => {
    setSnackbar(null);
  };
  
  return (
    <div>
      <WrappedSnackbar open={snackbar != null} 
        {...snackbar} 
        onClose={handleSnackbarClose} />
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a valid gmail or Google Workspace email address here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={onAdd}>Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
