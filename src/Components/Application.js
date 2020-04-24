import React, { useContext } from "react";
import { Router } from "@reach/router";
/*
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
*/
import SignIn from "./SignIn";
import Register from "./Register";
import ConnectStripe from "./ConnectStripe";
import MainPage from "./MainPage";
import { UserContext } from "../providers/UserProvider";


function Application() {
  const user = useContext(UserContext);

  return (
    user ?
    <Router>
      <Register path="/register" />
      <ConnectStripe path="/connect-stripe" />
      <MainPage path="/" />
    </Router>
  :      
    <Router>
      <SignIn path="/" />
    </Router>
  );
}
export default Application;

    /*
  */

  /*
        user ?
      <Router>
        <Switch >
          <Route path="/register">
              <Register />
          </Route>
          <Route path="/">
              <MainPage />
          </Route>
        </Switch>
      </Router>
    :
      <Router>      
        <Switch >
          <Route path="/">
              <SignIn />
          </Route>
        </Switch>
      </Router>
  */