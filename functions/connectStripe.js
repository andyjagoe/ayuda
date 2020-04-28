const functions = require('firebase-functions');
const stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');


exports.handler = function(data, context, firestoreDb) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const code = data.code;
    const state = data.state;

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    const name = context.auth.token.name || null;
    const picture = context.auth.token.picture || null;
    const email = context.auth.token.email || null;
    //console.log(uid, name, picture, email);


    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }
    // Check that we have a code for stripe
    if (!(typeof code === 'string') || code.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "code" containing the access code from stripe.');
    }
    // Check that we have a state value for stripe to prevent CSRF attacks
    if (!(typeof state === 'string') || state.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "state" containing the state value from the app.');
    }
    console.log(code);
    console.log(state);

    var userDoc = null;

    //check if state value is valid
    return firestoreDb.collection('/users').doc(uid).get()
    .then(doc => {
        if (!doc.exists) {
        console.log('No such document!');
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        } else if (doc.data().state === state) {
            console.log('State verification successful.');
            console.log('Document data:', doc.data());
        } else {
            console.log('State verification failed.');
            console.log('Document data:', doc.data());
            throw new functions.https.HttpsError('permission-denied', 'State verification failed.');
        }
        userDoc = doc.data();
        return true;
    })
    .then(result => {
        //api call to connect stripe account
        return response = stripe.oauth.token({
            grant_type: 'authorization_code',
            code: code,
        });
    })
    .then(accountResponse => {
        //Handle saving of necessary api details
        console.log('accountResponse: ', accountResponse);
        return firestoreDb.collection('/stripe').doc(uid).set({
            stripe_user_id: accountResponse.stripe_user_id,
            stripe_publishable_key: accountResponse.stripe_publishable_key,    
            refresh_token: accountResponse.refresh_token,
            access_token: accountResponse.access_token,
            scope: accountResponse.scope,
            token_type: accountResponse.token_type,
            livemode: accountResponse.livemode,
        }, { merge: true });
    })
    .then(response => {
        //console.log('Stripe connect successful: ', response);
        return true;
    })
    .catch(err => {
        console.log('Error: ', err);
        throw new functions.https.HttpsError('failed-precondition', 'Error verifying state.');
    });

}