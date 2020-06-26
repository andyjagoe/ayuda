import React, { useEffect, useRef } from 'react';
import firebase from 'firebase/app';
import 'firebase/functions';
import { navigate } from "@reach/router"
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const queryString = require('query-string');
 



export default function Authorize(props) {
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
                                        rid: parsed.rid
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
    <React.Fragment />
  );
}
