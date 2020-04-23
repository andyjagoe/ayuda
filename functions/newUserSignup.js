const uuidv4 = require('uuid/v4');

exports.handler = function(event, database, firestoreDb, admin) {
    //console.log(event);

    return firestoreDb.collection("users").doc(event.uid).set({
        displayName: event.displayName,
        email: event.email,    
        emailVerified: event.emailVerified,
        photoURL: event.photoURL,
        signedUpTime: admin.firestore.Timestamp.fromDate(new Date()),
    })
    .then(() => {
        console.log('newUserSignup succeeded');
        return database.ref('/users').child(event.uid).set({
            apiKey: uuidv4()
        });    
    })
    .then(() => {
        console.log('newUserSignup apiKey added');
        return true;
    })
    .catch(error => {
        console.error("newUserSignup Error: ", error);
        return false;
    });
}