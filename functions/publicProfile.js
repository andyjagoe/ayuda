const functions = require('firebase-functions');


exports.handler = function(data, context, firestoreDb) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const shortId = data.shortId;

    // Check that we have a uid
    if (!(typeof shortId === 'string') || shortId.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "shortId" containing the user shortId.');
    }
    
    
    let idRef = firestoreDb.collection('/id_map').doc(shortId);
    return idRef.get()
    .then(doc => {
        if (!doc.exists) {
            //console.log('Short Id map not found');
            throw new functions.https.HttpsError('not-found', 'Short ID map not found');
        }
        return firestoreDb.collection('/users').doc(doc.data().uid).get();
    })
    .then(doc => {
        if (!doc.exists) {
            //console.log('User not found');
            throw new functions.https.HttpsError('not-found', 'User not found');
        } else {
            //console.log('Document data:', doc.data());
            const profile = {
                displayName: doc.data().displayName || '',
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