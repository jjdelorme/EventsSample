import React from "react";
import ReactDOM from "react-dom";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Dashboard from './Dashboard';

ReactDOM.render(
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Dashboard />
  </LocalizationProvider>,
  document.querySelector('#root'),
);