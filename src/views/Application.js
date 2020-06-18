import React from "react";
import { Router } from "@reach/router";
import PrivateRoute from "components/PrivateRoute";
import SignIn from "./SignIn";
import SetupPayments from "./SetupPayments";
import ConnectStripe from "./ConnectStripe";
import SignedInHomePage from "./SignedInHomePage";
import SignedOutHomePage from "./SignedOutHomePage";
import ContactUsPage from "./ContactUsPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import TermsOfServicePage from "./TermsOfServicePage";
import PricingPage from "./PricingPage";
import SupportPage from "./SupportPage";
import EditProfilePage from "./EditProfilePage";
import ProfilePage from "./ProfilePage";
import AccountPage from "./AccountPage";
import JobPage from "./JobPage";
import GetJobPage from "./GetJobPage";
import AddJobPage from "./AddJobPage";
import Authorize from "./Authorize";
import Checkout from "./Checkout";
import Error from "./Error";
import AuthorizeSuccess from "./AuthorizeSuccess";
import ScrollToTop from "components/ScrollToTop";


function Application() {

  return (
  <Router>
    <ScrollToTop path="/">
      {/* Public Routes */}
      <SignIn path="/signin" />
      <SignedOutHomePage path="/" />
      <Authorize path="/authorize" />
      <AuthorizeSuccess path="/authorize_success" />
      <Checkout path="/checkout" />
      <ContactUsPage path="/contact" />
      <SupportPage path="/support" />
      <PricingPage path="/pricing" />              
      <ProfilePage path="/p/:shortId" />
      <PrivacyPolicyPage path="/privacy" />  
      <TermsOfServicePage path="/tos" />              
      <Error path="/error" />
      {/* Protected Routes */}
      <PrivateRoute path="/home" component={SignedInHomePage} />
      <PrivateRoute path="/setup-payments" component={SetupPayments} />
      <PrivateRoute path="/connect-stripe" component={ConnectStripe} />
      <PrivateRoute path="/profile" component={EditProfilePage} />
      <PrivateRoute path="/account" component={AccountPage} />
      <PrivateRoute path="/job/:jobId" component={JobPage} />
      <PrivateRoute path="/getjob" component={GetJobPage} />
      <PrivateRoute path="/addjob" component={AddJobPage} />
    </ScrollToTop>
  </Router>
  );  
}
export default Application;
