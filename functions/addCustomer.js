const functions = require('firebase-functions');
var stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');


exports.handler = function(data, context, firestoreDb, admin) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    const name = data.name;
    const email = data.email;
    const phone = data.phone || '';

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;


    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }
    // Check that we have a payer_id value for customer
    if (!(typeof name === 'string') || name.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "name".');
    }
    // Check that we have a state value for stripe to prevent CSRF attacks
    if (!(typeof email === 'string') || email.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one argument "topic" containing the state value from the app.');
    }

    //TODO: check for valid phone numbers

   return stripe.customers.create({   
        name: name,
        email: email,
        phone: phone
    })
    .then (result => {
        //console.log(result)
        return firestoreDb.collection('/users')
        .doc(uid)
        .collection('customers')
        .add({
            name: name,
            email: email,
            phone: phone,
            stripe_id: result.id,
            t: admin.firestore.Timestamp.fromDate(new Date()),
        });
    })
    .then(ref => {
        //console.log('Added customer with ID: ', ref.id);
        return true;
    })
    .catch(error => {
        console.error("addCustomer Error: ", error);
        throw new functions.https.HttpsError('failed-precondition', error.message);
    });

}