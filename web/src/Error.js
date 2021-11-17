import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function Error(props) {
  const error = props.message;
  const handleErrorClose = props.onErrorClose;
  
  return (
    <Snackbar open={error != null}>
        <Alert onClose={handleErrorClose} severity="error" variant="filled"
            sx={{ width: '100%' }}>
            {error}
        </Alert>
    </Snackbar>
  );      
}