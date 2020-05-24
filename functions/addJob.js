var moment = require('moment-timezone');
const functions = require('firebase-functions');
const axios = require('axios');
const zoomToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkFUZ2l2aEhuUUh5SDlYOXE0Z0E3aHciLCJleHAiOjE1OTA4NTc2NDMsImlhdCI6MTU5MDI1Mjg0M30.Nd5qmYtTXW3Ys2-saAS6ut0-hYf_7kL86HjXFn7aCgk';


function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

exports.handler = function(data, context, firestoreDb, admin) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const payer = data.payer;
    const payer_id = data.payer_id;
    const rate_id = data.rate_id;
    const topic = data.topic;
    const start = data.start;
    const duration = data.duration;
    const notes = data.notes || '';

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;


    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }
    // Check that we have a payer_id value for customer
    if (!(typeof payer_id === 'string') || payer_id.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "payer_id".');
    }
    // Check that we have a state value for stripe to prevent CSRF attacks
    if (!(typeof topic === 'string') || topic.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "topic" containing the state value from the app.');
    }
    // Check that we have a rate_id value for rate
    if (!(typeof rate_id === 'string') || rate_id.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "rate_id".');
    }

    //TODO:  Add error checking for valid start and duration values 

    var userDoc = null;
    var jobDoc = null;
    var zoomResponse  = null;

    //check if state value is valid
    return firestoreDb.collection('/users').doc(uid).get()
    .then(doc => {
        if (!doc.exists) {
        console.log('No such user!');
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        const zoomId = doc.data().zoomId;
        if (!(typeof zoomId === 'string') || zoomId.length === 0) {
            // Throwing an HttpsError so that the client gets the error details.
            throw new functions.https.HttpsError('failed-precondition', 'No Zoom ID available.');
        }
        userDoc = doc.data();
        return axios({
            method: 'post',
            url: `https://api.zoom.us/v2/users/${userDoc.zoomId}/meetings`,
            data: {
                "topic": topic,
                "type": "2",
                "start_time": moment(start).tz(userDoc.tz).format(), //TODO catch cases when tz missing
                "duration": duration,
                "timezone": userDoc.tz,
                "password": generatePassword(),
                "agenda": notes,
                "settings": {
                  "host_video": true,
                  "participant_video": true,
                  "join_before_host": false,
                  "use_pmi": false,
                  "audio": "voip"
                }
            },
            headers: {
              'Authorization': `Bearer ${zoomToken}`,
              'User-Agent': 'Zoom-api-Jwt-Request',
              'content-type': 'application/json'
            }
        });
    })
    .then(response => {
        //console.log('response data: ', response.data);
        zoomResponse = response.data
        
        jobDoc  = {
            uuid: response.data.uuid,
            id: response.data.id.toString(),
            payer: payer,
            payer_id: payer_id,
            rate_id: rate_id,
            topic: topic,
            agenda: notes,
            t: admin.firestore.Timestamp.fromDate(new Date(response.data.start_time)),
            d: response.data.duration,
            tz: response.data.timezone,
            start_url: response.data.start_url,
            join_url: response.data.join_url,
            password: response.data.password,
            status: 'pending',
            cancelled: false,               
        }
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('meetings')
            .add(jobDoc);
    })  
    .then(ref => {
        //console.log('Added job with ID: ', ref.id);        
        return firestoreDb.collection('/zoom_map')
            .doc(userDoc.zoomId)
            .collection('meetings')
            .doc(zoomResponse.id.toString())
            .set({id: ref.id});
    })
    .then(ref => {
        return true
    })
    .catch(error => {
        console.error(`Addjob error: ${error.message}`);
        throw new functions.https.HttpsError('failed-precondition', error.message);
    });

}