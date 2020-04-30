const functions = require('firebase-functions');
const axios = require('axios');
const zoomToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkFUZ2l2aEhuUUh5SDlYOXE0Z0E3aHciLCJleHAiOjE1ODg2NDk0MjQsImlhdCI6MTU4ODA0NDYyNH0.6riecbQKpVXkHPO_N2F0EiQFV3EwZBzi04qVLnPjL3k';



exports.handler = function(data, context, firestoreDb, admin) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const id = data.id;
    const zoom_id = data.zoom_id;

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
    // Check that we have required values
    if (!(typeof id === 'string') || id.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "id".');
    }
    // Check that we have required values
    if (!(typeof zoom_id === 'number')) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "zoom_id".');
    }

    return axios({
        method: 'delete',
        url: `https://api.zoom.us/v2/meetings/${zoom_id}`,
        headers: {
          'Authorization': `Bearer ${zoomToken}`,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
    })
    .then(response => {
        return firestoreDb.collection('/users')
        .doc(uid)
        .collection('meetings')
        .doc(id)
        .delete();
    })
    .then(ref => {
        console.log('Removed job with ID: ', id);
        return true;
    })
    .catch(error => {
        console.error("removeJob Error: ", error);
        return false;
    });

}