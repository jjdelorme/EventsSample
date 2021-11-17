import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function WrappedSnackbar(props) {
  const { open, message, severity, onClose } = props;
  const autoHideDuration = (severity === "error" ? null : 3000);
    
  return (
    <Snackbar open={open}  onClose={onClose}
            autoHideDuration={autoHideDuration}>
        <Alert onClose={onClose} severity={severity} 
            variant="filled"
            sx={{ width: '100%' }}>
            {message}
        </Alert>
    </Snackbar>
  );      
}