import React, { useContext, useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import OnboardingAppBar from './OnboardingAppBar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import { Router, Link, navigate } from "@reach/router";
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
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
    const classes = useStyles();
    const user = useContext(UserContext);
    const {photoURL, displayName, email, uid} = user;

    const [resultMessage, setResultMessage] = React.useState('Verifying Stripe account');
    const [resultSeverity, setResultSeverity] = React.useState('info');


    const queryString = require('query-string');
    const parsed = queryString.parse(props.location.search);

    async function handleSubmit() {
        var connectStripe = firebase.functions().httpsCallable('connectStripe');
        await connectStripe({code: parsed.code, state: parsed.state}).then(function(result) {
            var sanitizedMessage = result.data;
            console.log(result.data);
            setResultMessage('Stripe connected successfully')
            setResultSeverity('success')
        }).catch(function(error) {
            var code = error.code;
            var details = error.details;
            console.log(error.message);
            setResultMessage(error.message)
            setResultSeverity('error')
        });
    }

    useEffect(() => { 
        if ('code' in parsed && 'state' in parsed) {
            //console.log(`yes, continue ${parsed.code}`);
            handleSubmit() //TODO: add checks so this isn't called multiple times
        }  else {
            setResultMessage('Invalid request')
            setResultSeverity('error')
        }    
    }, [parsed]);
    
  
  return (
    <React.Fragment>
        <OnboardingAppBar />      
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <CircularProgress />
            <CircularProgress color="secondary" />
            <Grid container spacing={2} style={{ padding: 40}}>
                <Grid item xs={12}>
                    <Alert severity={resultSeverity}>
                        {resultMessage}
                    </Alert>  
                </Grid>
            </Grid>            
        </div>
        </Container>
    </React.Fragment>
  );
}
