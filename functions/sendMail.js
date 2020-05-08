const functions = require('firebase-functions');


exports.handler = function(data, context, firestoreDb, emailHandler) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    const name = context.auth.token.name || null;
    const email = context.auth.token.email || null;
    const user = {
        name: name,
        email: email,
        uid: uid
    }

    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }

    return emailHandler.sendAddJobProviderEmail(user)
}