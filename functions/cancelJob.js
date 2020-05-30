const functions = require('firebase-functions');


exports.handler = function(data, context, firestoreDb) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const id = data.id;

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;

    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }
    // Check that we have required values
    if (!(typeof id === 'string') || id.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "id".');
    }

    
    return firestoreDb.collection('/users')
    .doc(uid)
    .collection('meetings')
    .doc(id)
    .get()
    .then(doc => {
        if (!doc.exists) {
            console.log('No such job!');
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        if(!(doc.data().status === 'pending' || doc.data().status === 'authorized')) {
            throw new functions.https.HttpsError('failed-precondition', 
                `Cannot cancel job with state: ${doc.data().status}`);
        }

        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('meetings')
            .doc(id)
            .set({
                status: 'cancelled',
                cancelled: true,
            }, { merge: true });
    })
    .then(ref => {
        //console.log('Removed job with ID: ', id);
        return true;
    })
    .catch(error => {
        console.error(error);
        throw new functions.https.HttpsError('failed-precondition', error.message);
    });

}