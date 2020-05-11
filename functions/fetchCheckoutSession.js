const functions = require('firebase-functions');
const stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');


exports.handler = function(data, context, firestoreDb) {
    console.log(data)

    const id = data.id;
    const uid = data.uid;

    if (!(typeof id === 'string') || id.length === 0) {
        console.log('The function must be called with one argument "id".') 
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
    }
    if (!(typeof uid === 'string') || uid.length === 0) {
        console.log('The function must be called with one argument "uid".') 
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');      
    }

    const user = {
        uid: uid
    }

    return firestoreDb.collection('/users')
    .doc(uid)
    .get()
    .then(doc => {
        if (!doc.exists) {
            console.log('No such user!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        const userDoc = doc.data();
        user.name = doc.data().displayName;
        user.email = doc.data().email

        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('meetings')
            .doc(id)
            .get();
    })   
    .then(doc => {
        if (!doc.exists) {
            console.log('No such meeting!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        const jobRecord = doc.data()
        console.log(jobRecord)
        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'setup',
            customer: 'cus_HFwOnqGEatz7kv',
            success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://example.com/cancel',
        });
    })
    .then(result => {
        console.log(result);
        return result;
    })
    .catch(error => {
        console.error("Error: ", error);
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
    });

}