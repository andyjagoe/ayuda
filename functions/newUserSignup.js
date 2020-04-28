const axios = require('axios');
const zoomToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkFUZ2l2aEhuUUh5SDlYOXE0Z0E3aHciLCJleHAiOjE1ODg2NDk0MjQsImlhdCI6MTU4ODA0NDYyNH0.6riecbQKpVXkHPO_N2F0EiQFV3EwZBzi04qVLnPjL3k';

exports.handler = function(event, database, firestoreDb, admin) {
    //console.log(event);

    return axios({
        method: 'post',
        url: 'https://api.zoom.us/v2/users',
        data: {
            "action": "custCreate",
            "user_info": {
              "email": event.email,
              "type": 1,
            }
        },
        headers: {
          'Authorization': `Bearer ${zoomToken}`,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
    })
    .then((response) => {
        console.log('response data: ', response.data);

        return firestoreDb.collection("users").doc(event.uid).set({
            displayName: event.displayName,
            email: event.email,    
            emailVerified: event.emailVerified,
            photoURL: event.photoURL,
            zoomId: response.data.id,
            signedUpTime: admin.firestore.Timestamp.fromDate(new Date()),
        });    
    })
    .then(response => {
        console.log('newUserSignup succeeded: ', response);
        return true;
    })  
    .catch(error => {
        console.error("newUserSignup Error: ", error);
        return false;
    });
}