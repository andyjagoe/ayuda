const shortid = require('shortid');


const createShortUrl = async (uid, firestoreDb) => {
    const saveId = (short, uid, firestoreDb) => {
        let shortUrlRef = firestoreDb.collection('id_map').doc(short);
        return firestoreDb.runTransaction(t => {
            return t.get(shortUrlRef).then(doc => {
                if (doc.exists) {
                    return Promise.reject(new Error('Short ID already exists'));
                }
                t.set(shortUrlRef, { uid: uid })
                return Promise.resolve('Short id mapped successfully');
            });
        })        
        .then(result => {
            //console.log("Transaction success: ", result)
            return short
        })
        .catch(err => {
            console.log("Transaction failure ", err.message)
            return false
        })
    }

    var finalShortId = false;
    var shortId = null;
    var retries = 0;
    while (retries < 5 && finalShortId === false) {
        shortId = shortid.generate()
        //console.log(`short(${retries}): ${shortId}`);
        /* eslint-disable no-await-in-loop */
        finalShortId = await saveId(shortId, uid, firestoreDb)
        /* eslint-enable no-await-in-loop */
        retries++
    }

    return finalShortId
}


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
        
        const shortId = await createShortUrl(user.uid, firestoreDb);

        await firestoreDb.collection("users").doc(event.uid).set({
            displayName: event.displayName,
            email: event.email,    
            emailVerified: event.emailVerified,
            photoURL: event.photoURL,
            zoomId: zoomResponse.data.id,
            shortId: shortId || '',
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