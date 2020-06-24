const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secretkey);


exports.handler = async function(data, context, firestoreDb, admin) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;

    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }

    return firestoreDb.collection('/stripe').doc(uid).get()
    .then(doc => {
        if (!doc.exists) {
        console.log('No stripe account for this user');
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        
        return stripe.accounts.createLoginLink(doc.data().stripe_user_id);
    })
    .then(ref => {
        console.log('Got login link: ', JSON.stringify(ref));
        return {url: ref.url};
    })
    .catch(error => {
        console.error("account Error: ", error);
        throw new functions.https.HttpsError('failed-precondition', error.message);
    });

}