var moment = require('moment-timezone');
const functions = require('firebase-functions');
const axios = require('axios');
const zoomToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkFUZ2l2aEhuUUh5SDlYOXE0Z0E3aHciLCJleHAiOjE1ODg2NDk0MjQsImlhdCI6MTU4ODA0NDYyNH0.6riecbQKpVXkHPO_N2F0EiQFV3EwZBzi04qVLnPjL3k';


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
    if (!(typeof payer === 'string') || payer.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "payer".');
    }
    // Check that we have a state value for stripe to prevent CSRF attacks
    if (!(typeof topic === 'string') || topic.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "topic" containing the state value from the app.');
    }

    //TODO:  Add error checking for valid start, duration, payer and rate values 

    //console.log(payer);
    //console.log(topic);
    //console.log(start);
    //console.log(duration);
    //console.log(notes);

    var userDoc = null;

    //check if state value is valid
    return firestoreDb.collection('/users').doc(uid).get()
    .then(doc => {
        if (!doc.exists) {
        console.log('No such document!');
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        const zoomId = doc.data().zoomId;
        if (!(typeof zoomId === 'string') || zoomId.length === 0) {
            // Throwing an HttpsError so that the client gets the error details.
            throw new functions.https.HttpsError('failed-precondition', 'No Zoom ID available.');
        }
        userDoc = doc.data();
        return true;
    })
    .then(result => {
        const userTz = moment(start).tz(userDoc.tz).format();  //TODO catch cases when tz missing
        return axios({
            method: 'post',
            url: `https://api.zoom.us/v2/users/${userDoc.zoomId}/meetings`,
            data: {
                "topic": topic,
                "type": "2",
                "start_time": userTz,
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
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('meetings')
            .add({
                uuid: response.data.uuid,
                id: response.data.id,
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
                password: response.data.password                
        });
    })  
    .then(ref => {
        console.log('Added job with ID: ', ref.id);
        return true;
    })
    .catch(error => {
        console.error("addJob Error: ", error);
        return false;
    });

}