import React from "react";
import Application from "./Components/Application";
import UserProvider from "./providers/UserProvider";
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme';

function App() {
  return (
    <UserProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Application />
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;