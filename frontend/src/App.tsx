import { useState } from 'react';
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { blue, green } from "@mui/material/colors";
import './App.css'
import Layout from './components/Layout';

const theme = createTheme({
  typography: {
    fontFamily: [
      "Open Sans",
      "sans-serif"
    ].join(",")
  },
  palette: {
    mode: "dark",
    primary: {
      main: blue[500],
      contrastText: "#fff"
    },
    secondary: {
      main: green[500],
      contrastText: "#fff"
    },
  }
});

function App() {
 return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

     <Layout>
        <h6>Hello, world</h6>
      </Layout>
    </ThemeProvider>
  )
}

export default App;
