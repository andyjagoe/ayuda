import React, { useContext, useState, useEffect, useRef } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import OnboardingAppBar from './OnboardingAppBar';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Router, Link, navigate } from "@reach/router";
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import { firestore } from "../firebase"
import firebase from 'firebase/app';
import 'firebase/functions';
 

const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));


export default function ConnectStripe(props) {
  const user = useContext(UserContext);
  const {photoURL, displayName, email, uid} = user;
  const classes = useStyles();

  const queryString = require('query-string');
  const parsed = queryString.parse(props.location.search);
  console.log(parsed);

  if ('code' in parsed) {
      console.log(`yes, continue ${parsed.code}`);
      var connectStripe = firebase.functions().httpsCallable('connectStripe');
      connectStripe({code: parsed.code, state: parsed.state}).then(function(result) {
        var sanitizedMessage = result.data;
        console.log(result.data);
      }).catch(function(error) {
        // Getting the Error details.
        var code = error.code;
        var message = error.message;
        var details = error.details;
        console.log(error.message);
      });
  } else {
    console.log('no, redirect')
    navigate('/register'); //TODO: fix this to show error message
  }

  /*
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await firestore.collection('/users').doc(uid).set({
        firstName: firstName,
        lastName: lastName,    
        service: service,
    }, { merge: true });
    } catch (error) {
      console.log(error.message);
    }

    navigate('/');
  }
  */

  return (
    <React.Fragment>
        <OnboardingAppBar />      
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <CircularProgress />
            <CircularProgress color="secondary" />
        </div>
        </Container>
    </React.Fragment>
  );
}
