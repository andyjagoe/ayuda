import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import OnboardingAppBar from 'components/OnboardingAppBar';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import firebase from 'firebase/app';
import 'firebase/functions';
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


export default function Checkout(props) {
    const classes = useStyles();
    const parsed = queryString.parse(props.location.search);

    useEffect(() => { 
    }, []);

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
            const sessionId = snap.data.sessionId
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({
                sessionId,
            });
        } catch (error) {
            console.error("Error: ", error);
        }
    }      
  
  return (
    <React.Fragment>
        <OnboardingAppBar />
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
                <ShoppingCartIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                Book a session
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
