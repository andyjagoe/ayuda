import React from "react";
import { Router } from "@reach/router";
import PrivateRoute from "components/PrivateRoute";
import SignIn from "./SignIn";
import Register from "./Register";
import ConnectStripe from "./ConnectStripe";
import SignedInHomePage from "./SignedInHomePage";
import SignedOutHomePage from "./SignedOutHomePage";
import ContactUsPage from "./ContactUsPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import TermsOfServicePage from "./TermsOfServicePage";
import PricingPage from "./PricingPage";
import SupportPage from "./SupportPage";
import ProfilePage from "./ProfilePage";
import AccountPage from "./AccountPage";
import JobPage from "./JobPage";
import GetJobPage from "./GetJobPage";
import AddJobPage from "./AddJobPage";
import Authorize from "./Authorize";
import Checkout from "./Checkout";
import Error from "./Error";
import AuthorizeSuccess from "./AuthorizeSuccess";


function Application() {

  return (
  <Router>
    {/* Public Routes */}
    <SignIn path="/signin" />
    <SignedOutHomePage path="/" />
    <Authorize path="/authorize" />
    <AuthorizeSuccess path="/authorize_success" />
    <Checkout path="/checkout" />
    <ContactUsPage path="/contact" />
    <SupportPage path="/support" />
    <PricingPage path="/pricing" />              
    <PrivacyPolicyPage path="/privacy" />  
    <TermsOfServicePage path="/tos" />              
    <Error path="/error" />
    {/* Protected Routes */}
    <PrivateRoute path="/home" component={SignedInHomePage} />
    <PrivateRoute path="/register" component={Register} />
    <PrivateRoute path="/connect-stripe" component={ConnectStripe} />
    <PrivateRoute path="/profile" component={ProfilePage} />
    <PrivateRoute path="/account" component={AccountPage} />
    <PrivateRoute path="/job/:jobId" component={JobPage} />
    <PrivateRoute path="/getjob" component={GetJobPage} />
    <PrivateRoute path="/addjob" component={AddJobPage} />
  </Router>
  );  
}
export default Application;
