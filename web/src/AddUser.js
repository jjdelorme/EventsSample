import React, { useState, useCallback } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import WrappedSnackbar from './WrappedSnackbar';
import { createUser } from './eventService';

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

async function addUser(email, authToken) {
  console.log('saving user', email);

  const response = createUser(email, authToken)
  .then((response) => {
    if (!response.ok)
      return error(`Server error: ${response.statusText}`);
    else
      return success(`Created user ${email}`);
  })
  .catch((err) => {
    return error(`Unexpected error ${err}`);
  });

  return response;
};

export default function AddUser(props) {
  const { open, onClose, user } = props;
  const [ snackbar, setSnackbar ] = useState(null);
  const [ input, setInput ] = useState({});

  const onInputChange = (e) => setInput({
    ...input,
    [e.currentTarget.name]: e.currentTarget.value
  })

  const cbSnackbarClose = useCallback(() => {
    setSnackbar(null);
  }, []);

  const cbAddUser = useCallback(() => {
    addUser(input.email, user.authToken)
    .then((result) => {
      console.log('addUser result', result);
      setSnackbar(result);
      onClose();
    });
  }, [input, user, onClose]); 

  return (
    <div>
      <WrappedSnackbar open={snackbar != null} 
        {...snackbar} 
        onClose={cbSnackbarClose} />
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
            onChange={onInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={cbAddUser}>Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
