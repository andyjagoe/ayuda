const axios = require('axios');
const zoomToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkFUZ2l2aEhuUUh5SDlYOXE0Z0E3aHciLCJleHAiOjE1ODk1MDk0ODAsImlhdCI6MTU4ODkwNDY4MH0.pols3IekbCUqEBgqK4Hf_CNPt0QrY2feZKmsiY7Yir8';

exports.handler = function(event, firestoreDb, admin) {
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