import React, { useEffect, useRef } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import firebase from 'firebase/app';
import 'firebase/functions';
import { navigate } from "@reach/router"
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
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



export default function Authorize(props) {
    const classes = useStyles();
    const parsed = queryString.parse(props.location.search);
    const firstRender = useRef(true)

    useEffect(() => {
        if (firstRender.current) {
          firstRender.current = false
          redirectToStripe()
        }        
    }, [])
    

    async function redirectToStripe() {
        if (!parsed.id) {   
            console.log('The function must be called with one argument "id".') 
            return
        }
        if (!parsed.uid) {   
            console.log('The function must be called with one argument "uid".')
            return
        }
        if (!parsed.cid) {   
            console.log('The function must be called with one argument "cid".')
            return
        }
        if (!parsed.rid) {   
            console.log('The function must be called with one argument "rid".')
            return
        }

        try {
            var fetchCheckoutSession = firebase.functions().httpsCallable('fetchCheckoutSession');
            const snap = await fetchCheckoutSession({uid: parsed.uid, 
                                        id: parsed.id,
                                        cid: parsed.cid,
                                        rid: parsed.rid,
                                        invoice: parsed.invoice,
                                        });
            if (snap.data.hasValidAuth === true) {
              navigate('/authorize_success', { state: { success_message: snap.data.successMessage } })
            } else {
              const sessionId = snap.data.sessionId
              const stripe = await stripePromise;
              const { error } = await stripe.redirectToCheckout({
                  sessionId,
              });  
            }
        } catch (error) {
            console.error("Error: ", error);
            navigate('/error', { state: { error: error } })
        }
    }      
  
  return (    
    <React.Fragment>
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
