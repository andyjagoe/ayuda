const functions = require('firebase-functions');



exports.handler = function(data, context, firestoreDb) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;


    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }

    
    let stripeRef = firestoreDb.collection('/stripe').doc(uid);
    return stripeRef.get()
    .then(doc => {
        if (!doc.exists) {
            //console.log('No Stripe credentials for this user');
            throw new functions.https.HttpsError('permission-denied', 'Payments not enabled.');
        } else {
            //console.log('Document data:', doc.data());
            return true;
        }
    })
    .catch(err => {
        console.log('Error getting document', JSON.stringify(err));
        if (err.code === 'permission-denied') {
            throw new functions.https.HttpsError(err.code, err.message);
        } else {
            throw new functions.https.HttpsError('internal', err.message);
        }
    });

}