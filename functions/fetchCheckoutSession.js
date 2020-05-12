const functions = require('firebase-functions');
const moment = require('moment');
const stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');



const formatDateDescription = (jobRecord) => {
    const start = moment(jobRecord.t.toDate())
        .tz(jobRecord.tz)
        .format('MMMM Do, h:mm')
    const end = moment
        .unix(jobRecord.t.seconds)
        .tz(jobRecord.tz)
        .add(jobRecord.d,"m")
        .format('h:mm a z')
    return `${start} - ${end}`
}

const formatRateDescription = (rateRecord) => {
    const currencyText = (rateRecord.currency === 'usd') ? 
            `$${ rateRecord.rate }` : 
            `${ rateRecord.rate } ${rateRecord.currency.toUpperCase()}`

    return currencyText
}



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

    var userDoc = null;
    var jobRecord = null;
    var customerRecord = null;
    var rateRecord = null;
    var stripeRecord = null;

    return firestoreDb.collection('/users')
    .doc(uid)
    .get()
    .then(doc => {
        if (!doc.exists) {
            console.log('No such user!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        userDoc = doc.data();
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
        jobRecord = doc.data()
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('customers')
            .doc(jobRecord.payer_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such customer!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        customerRecord = doc.data()
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('rates')
            .doc(jobRecord.rate_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such rate!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        rateRecord = doc.data()
        return firestoreDb.collection('/stripe')
            .doc(uid)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('User not set up for payments') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        stripeRecord = doc.data()
        const dateDescription = formatDateDescription(jobRecord)
        const rateDescription = formatRateDescription(rateRecord)
        const charge = rateRecord.rate * (jobRecord.d / 60) * 100

        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                name: `${jobRecord.topic} @ ${rateDescription} per hour.`,
                description: `${dateDescription}. Cancel any time. You will not be charged ` +
                    `until your session is complete.`,
                amount: charge,
                currency: rateRecord.currency.toLowerCase(),
                quantity: 1,
            }],
            payment_intent_data: {
                capture_method: 'manual',
                on_behalf_of: stripeRecord.stripe_user_id,
                setup_future_usage: 'on_session', 
                description: `${dateDescription} @ ${rateDescription} per hour`
            },
            customer: customerRecord.stripe_id,
            submit_type:  'book',
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