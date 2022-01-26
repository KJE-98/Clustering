import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
import reportWebVitals from './reportWebVitals';

import Paper from '@mui/material/Paper';

const theme = createTheme({
  palette: {
    primary: {
      main: '#85a5d4',
      light: '#8879c9',
      dark: '#4d3f8f',
    },
    secondary: {
      main: '#8580d1',
      light: '#c466c1',
      dark: '#03c6fc'
    },
    info: {
      main: '#c255be',
      light: '#c466c1',
      dark: '#853682'
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
   <ThemeProvider theme={theme}>
    <App />
   </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
