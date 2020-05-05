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
    </Router>
  :      
    <Router>
      <SignIn path="/" />
    </Router>
  );
}
export default Application;
