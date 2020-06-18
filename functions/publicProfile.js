const functions = require('firebase-functions');


exports.handler = function(data, context, firestoreDb) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const uid = data.uid;

    // Check that we have a uid
    if (!(typeof uid === 'string') || uid.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "uid" containing the user id.');
    }
    
    
    let userRef = firestoreDb.collection('/users').doc(uid);
    return userRef.get()
    .then(doc => {
        if (!doc.exists) {
            //console.log('User not found');
            throw new functions.https.HttpsError('not-found', 'User not found');
        } else {
            //console.log('Document data:', doc.data());
            const profile = {
                firstName: doc.data().firstName || '',
                lastName: doc.data().lastName || '',
                headline: doc.data().headline || '',
                bio: doc.data().bio || '',
                photoURL: doc.data().photoURL || '',
            }
            return profile;
        }
    })
    .catch(err => {
        console.log('Error getting document', JSON.stringify(err));
        if (err.code === 'not-found') {
            throw new functions.https.HttpsError(err.code, err.message);
        } else {
            throw new functions.https.HttpsError('internal', err.message);
        }
    });

}