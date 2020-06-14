

exports.handler = function(event, firestoreDb, admin, zoomHelper, emailHandler) {
    //console.log(event);

    var zoomResponse = null
    const user = {
        uid: event.uid,
        name: event.displayName,
        email: event.email,
    }

    const myAxios = zoomHelper.getAxiosWithInterceptor()
    return myAxios({
        method: 'post',
        url: 'https://api.zoom.us/v2/users',
        data: {
            "action": "custCreate",
            "user_info": {
              "email": event.email,
              "type": 1,
            }
        }
    })
    .then((response) => {
        //console.log('response data: ', response.data);
        zoomResponse = response.data

        return firestoreDb.collection("users").doc(event.uid).set({
            displayName: event.displayName,
            email: event.email,    
            emailVerified: event.emailVerified,
            photoURL: event.photoURL,
            zoomId: zoomResponse.id,
            signedUpTime: admin.firestore.Timestamp.fromDate(new Date()),
        }, { merge: true });    
    })
    .then(response => {
        //console.log('Adding zoom mapping for webhook callbacks: ', response);
        return firestoreDb.collection("zoom_map").doc(zoomResponse.id).set({
            uid: event.uid,
        });
    })  
    .then(response => {
        //console.log('newUserSignup added to db: ', JSON.stringify(response));
        return emailHandler.sendWelcomeEmail(user)
    })  
    .then(response => {
        //console.log('newUserSignup success: ', JSON.stringify(response));
        return true;
    })  
    .catch(error => {
        console.error("newUserSignup Error: ", error);
        return false;
    });
}