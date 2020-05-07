var moment = require('moment-timezone');
const functions = require('firebase-functions');
const axios = require('axios');
const zoomToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkFUZ2l2aEhuUUh5SDlYOXE0Z0E3aHciLCJleHAiOjE1ODg2NDk0MjQsImlhdCI6MTU4ODA0NDYyNH0.6riecbQKpVXkHPO_N2F0EiQFV3EwZBzi04qVLnPjL3k';


exports.handler = function(data, context, firestoreDb, admin) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const job_id = data.job_id;
    const payer = data.payer;
    const payer_id = data.payer_id;
    const rate_id = data.rate_id;
    const topic = data.topic;
    const tz = data.tz;
    const notes = data.notes || '';
    const start = data.start;
    const duration = data.duration;
    const zoom_id = data.zoom_id;

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;


    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }
    // Check that we have a job_id value for customer
    if (!(typeof job_id === 'string') || job_id.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "job_id".');
    }
    if (!(typeof payer === 'string') || payer.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "payer".');
    }
    if (!(typeof payer_id === 'string') || payer_id.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "payer_id".');
    }
    if (!(typeof rate_id === 'string') || rate_id.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "rate_id".');
    }
    if (!(typeof topic === 'string') || topic.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "topic" containing the state value from the app.');
    }
    if (!(typeof tz === 'string') || tz.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "tz" containing the state value from the app.');
    }

    //TODO:  Add error checking for valid start (check for < now()), duration (check for negative), zoom_id  

    const tzAdjustedStart = moment(start).tz(tz);  //TODO catch cases when tz missing


    //console.log(zoom_id);   
    //console.log(topic);
    //console.log(tzAdjustedStart);
    //console.log(duration);
    //console.log(notes);

    return firestoreDb.collection('/users')
    .doc(uid)
    .collection('meetings')
    .doc(job_id)
    .get()
    .then(doc => {
        if (!doc.exists) {
        console.log('No such document!');
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        console.log('Verified user owns this meeting');
        return true;
    })
    .then(result => {
        return axios({
            method: 'patch',
            url: `https://api.zoom.us/v2/meetings/${zoom_id}`,
            data: {
                "topic": topic,
                "start_time": tzAdjustedStart.format(),
                "duration": duration,
                "timezone": tz,
                "agenda": notes,
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
            .doc(job_id)
            .set({
                payer: payer,
                payer_id: payer_id,
                rate_id: rate_id,
                topic: topic,
                agenda: notes,
                t: admin.firestore.Timestamp.fromDate(new Date(tzAdjustedStart.toDate())),
                d: duration,
                tz: tz,
        }, { merge: true });
    })  
    .then(ref => {
        console.log('updateJob success: ', ref);
        return true;
    })
    .catch(error => {
        console.error("updateJob Error: ", error);
        return false;
    });

}