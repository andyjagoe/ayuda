import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import CheckIcon from '@material-ui/icons/Check';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import OnboardingAppBar from './OnboardingAppBar';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
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


export default function AuthorizeSuccess(props) {
    const classes = useStyles();
    const parsed = queryString.parse(props.location.search);
    const [successMessage, setSuccessMessage] = useState('Your session has been booked')

    useEffect(() => {
      handleSessionID()
      loadSuccessMessage(props)
    });

    function loadSuccessMessage(props) {
      try {
        const msg = props.location.state.success_message
        console.log(msg)
        if (!msg) {   
            return
        }
        setSuccessMessage(msg)  
      } catch (error) {
        console.log("Using default success message");
      }

    }

    async function handleSessionID() {
        if (!parsed.session_id) {   
            console.log('The function must be called with one argument "session_id".') 
            return
        }

        const sessionId = parsed.session_id
        console.log(sessionId)

    }
  
  return (
    <React.Fragment>
        <OnboardingAppBar />      
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
                <CheckIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                {successMessage}
            </Typography>
            <Grid container spacing={2} style={{ padding: 40}}>
                <Grid item xs={12}>
                </Grid>
            </Grid>            
        </div>
        </Container>
    </React.Fragment>
  );
}
