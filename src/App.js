import React from "react";
import Application from "./views/Application";
import UserProvider from "./providers/UserProvider";
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import HubSpotChat from  'components/HubSpotChat';
import theme from './theme';

function App() {
  return (
    <UserProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Application />
        <HubSpotChat />
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;