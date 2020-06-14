

exports.handler = async function(event, firestoreDb, admin, zoomHelper, emailHandler) {
    //console.log(event);

    const user = {
        uid: event.uid,
        name: event.displayName,
        email: event.email,
    }

    try {
        const myAxios = zoomHelper.getAxiosWithInterceptor()
        const zoomResponse = await myAxios({
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
        
        await firestoreDb.collection("users").doc(event.uid).set({
            displayName: event.displayName,
            email: event.email,    
            emailVerified: event.emailVerified,
            photoURL: event.photoURL,
            zoomId: zoomResponse.data.id,
            signedUpTime: admin.firestore.Timestamp.fromDate(new Date()),
        }, { merge: true });    

        await firestoreDb.collection('/users').doc(event.uid).collection('rates').add({
            name: '0',
            rate: parseFloat('0'),
            currency: 'usd',
            t: admin.firestore.Timestamp.fromDate(new Date()),    
        })

        //console.log('Adding zoom mapping for webhook callbacks: ', response);
        await firestoreDb.collection("zoom_map").doc(zoomResponse.data.id).set({
            uid: event.uid,
        });
        
        //console.log('newUserSignup added to db: ', JSON.stringify(response));
        await emailHandler.sendWelcomeEmail(user)

        return true

    } catch (error) {
        console.error("Error: ", error);
        return false
    }
}