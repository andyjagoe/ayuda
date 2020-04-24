const functions = require('firebase-functions');


exports.handler = function(data, context, firestoreDb) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const code = data.code;
    const state = data.state;

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
    if (!(typeof code === 'string') || code.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "code" containing the access code from stripe.');
    }
    // Check that we have a state value for stripe to prevent CSRF attacks
    if (!(typeof state === 'string') || state.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "state" containing the state value from the app.');
    }
    console.log(code);
    console.log(state);

    return true;

    /*
    // Phone number lookup to confirm eligibility
    const twilioClient = new twilio(
        functions.config().twilio.accountsid, 
        functions.config().twilio.authtoken
    );

    return twilioClient.lookups.phoneNumbers(phoneNumber)      
    .fetch({type: 'carrier'})      
    .then(phone_number => {
        console.log(phone_number);

        if (phone_number.carrier.error_code !== null) {
            throw new functions.https.HttpsError('failed-precondition', 'Cannot get carrier ' 
            + 'information for this number.');      
        } else if (phone_number.carrier.type === 'mobile') {
            throw new functions.https.HttpsError('failed-precondition', 'We cannot add texting to' 
            + ' mobile numbers.');            
        }

        //Authy start call for one time passcode to verify phone number possession     
        return authyClient.startPhoneVerification({ countryCode: 'US', locale: 'en', phone: phoneNumber, via: enums.verificationVia.CALL });
    })
    .then((response) => {            
        console.log('Phone information', response);
        const d = new Date();
        database.ref('/users').child(uid).child('loa').child('request').update({
            "tn": phoneNumber,
            "ip": ipAddress,
            "time": d.toISOString(),
            "authy": response,
            "screenshotPath": screenshotPath
        });
        if (response.success === true) {
            return response;
        }
        throw new functions.https.HttpsError('failed-precondition', 'Could not begin ' 
        + ' voice one time passcode verification.');
    })
    .catch((error) => {
        console.log(error);
        // remove screenshot from storage...
        const file = bucket.file(screenshotPath);
        file.delete();
        if (error.name === 'HttpsError') {            
            throw new functions.https.HttpsError(error.code, error.message);
        } else {
            throw new functions.https.HttpsError('unknown', error.message);
        }        
    });

    */
}