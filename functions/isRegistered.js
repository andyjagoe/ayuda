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
            console.log('No such document!');
            return false;
        } else {
            //console.log('Document data:', doc.data());
            return true;
        }
    })
    .catch(err => {
        console.log('Error getting document', err);
        throw new functions.https.HttpsError('internal', error.message);
    });

}