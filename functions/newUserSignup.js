

exports.handler = function(event, firestoreDb, admin, zoomHelper) {
    //console.log(event);

    var zoomResponse = null

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
        });    
    })
    .then(response => {
        //console.log('Adding zoom mapping for webhook callbacks: ', response);
        return firestoreDb.collection("zoom_map").doc(zoomResponse.id).set({
            uid: event.uid,
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