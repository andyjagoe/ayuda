const functions = require('firebase-functions');
const axios = require('axios');
const zoomToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkFUZ2l2aEhuUUh5SDlYOXE0Z0E3aHciLCJleHAiOjE1ODk1MDk0ODAsImlhdCI6MTU4ODkwNDY4MH0.pols3IekbCUqEBgqK4Hf_CNPt0QrY2feZKmsiY7Yir8';



exports.handler = function(data, context, firestoreDb, admin, emailHandler) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const id = data.id;

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    const name = context.auth.token.name || null;
    const email = context.auth.token.email || null;
    const user = {
        name: name,
        email: email,
        uid: uid
    }


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

    
    var jobDoc = null;
    var customerDoc = null;
    var rateDoc = null;


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
        jobDoc = doc.data();
        jobDoc.ref_id =  doc.id;
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('customers')
            .doc(jobDoc.payer_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such customer!');
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        customerDoc = doc.data();
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('rates')
            .doc(jobDoc.rate_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such rate!');
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        rateDoc = doc.data();
        return axios({
            method: 'delete',
            url: `https://api.zoom.us/v2/meetings/${jobDoc.id}`,
            headers: {
              'Authorization': `Bearer ${zoomToken}`,
              'User-Agent': 'Zoom-api-Jwt-Request',
              'content-type': 'application/json'
            }
        });
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
        return emailHandler.sendCancelJobProviderEmail(user, jobDoc, customerDoc, rateDoc);
    })
    .then(ref => {
        console.log('Cancel job email sent to provider');
        return true;
    })
    .catch(error => {
        console.error("removeJob Error: ", error);
        return false;
    });

}