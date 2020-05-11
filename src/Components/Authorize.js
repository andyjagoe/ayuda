import React, { useContext, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import OnboardingAppBar from './OnboardingAppBar';
import Grid from '@material-ui/core/Grid';
import { navigate } from "@reach/router";
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import firebase from 'firebase/app';
import 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('pk_test_SRhAdAz2m4pWUCjiCetL30r0');
const queryString = require('query-string');
 

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

    const parsed = queryString.parse(props.location.search);

    useEffect(() => { 
        redirectToStripe()
    });

    async function redirectToStripe() {
        if (!parsed.id) {   
            console.log('The function must be called with one argument "id".') 
            return
        }
        if (!parsed.uid) {   
            console.log('The function must be called with one argument "uid".')
            return
        }

        console.log(parsed.uid)
        console.log(parsed.id)
        var sessionId = null


        var fetchCheckoutSession = firebase.functions().httpsCallable('fetchCheckoutSession');
        await fetchCheckoutSession({uid: parsed.uid, id: parsed.id}).then(function(result) {
            console.log(result.data);
            sessionId = result.data.id
            return sessionId    
        })
        .then(result => {
            console.log(result);
            return stripePromise;
        })    
        .then(stripe => {
            console.log(stripe);
            return stripe.redirectToCheckout({
                sessionId,
            });
        })    
        .catch(function(error) {
            console.log(error.message);
            //TODO: Handle user navigation for error state
        });

    }      
  
  return (
    <React.Fragment>
        <OnboardingAppBar />      
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Grid container spacing={2} style={{ padding: 40}}>
                <Grid item xs={12}>
                </Grid>
            </Grid>            
        </div>
        </Container>
    </React.Fragment>
  );
}
