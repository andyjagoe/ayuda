import React from 'react';
import firebase from 'firebase/app';
import 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('pk_test_SRhAdAz2m4pWUCjiCetL30r0');
const queryString = require('query-string');
 



export default function Authorize(props) {
    const parsed = queryString.parse(props.location.search);

    redirectToStripe()

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
                                        rid: parsed.rid
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
    <React.Fragment />
  );
}
