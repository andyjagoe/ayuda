import React, { useContext } from "react";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import Register from "./Register";
import ConnectStripe from "./ConnectStripe";
import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";
import AccountPage from "./AccountPage";
import JobPage from "./JobPage";
import GetJobPage from "./GetJobPage";
import AddJobPage from "./AddJobPage";
import LoadingPage from "./LoadingPage";
import Authorize from "./Authorize";
import Checkout from "./Checkout";
import Error from "./Error";
import AuthorizeSuccess from "./AuthorizeSuccess";
import { UserContext } from "../providers/UserProvider";


function Application() {
  const user = useContext(UserContext)

  return (
    user ?
    <Router>
      <LoadingPage path="/loading" />
      <HomePage path="/" />
      <Register path="/register" />
      <ConnectStripe path="/connect-stripe" />
      <ProfilePage path="/profile" />
      <AccountPage path="/account" />
      <JobPage path="/job/:jobId" />
      <GetJobPage path="/getjob" />
      <AddJobPage path="/addjob" />
      <Authorize path="/authorize" />
      <AuthorizeSuccess path="/authorize_success" />
      <Checkout path="/checkout" />
      <Error path="/error" />
    </Router>
  :      
    <Router>
      <SignIn path="/" />
      <Authorize path="/authorize" />
      <AuthorizeSuccess path="/authorize_success" />
      <Checkout path="/checkout" />
      <Error path="/error" />
    </Router>
  );
}
export default Application;
