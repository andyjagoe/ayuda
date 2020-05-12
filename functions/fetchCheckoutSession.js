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



exports.handler = async function(data, context, firestoreDb) {
    console.log(data)

    const id = data.id;
    const uid = data.uid;
    const cid = data.cid;
    const rid = data.rid;

    if (!(typeof id === 'string') || id.length === 0) {
        console.log('The function must be called with one argument "id".') 
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
    }
    if (!(typeof uid === 'string') || uid.length === 0) {
        console.log('The function must be called with one argument "uid".') 
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');      
    }
    if (!(typeof cid === 'string') || cid.length === 0) {
        console.log('The function must be called with one argument "cid".') 
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');      
    }
    if (!(typeof rid === 'string') || rid.length === 0) {
        console.log('The function must be called with one argument "rid".') 
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');      
    }


    try {
        const [
            userSnap,
            jobSnap,
            customerSnap,
            rateSnap,
            stripeSnap        
        ] = await Promise.all([
            firestoreDb.collection('/users').doc(uid).get(),
            firestoreDb.collection('/users').doc(uid).collection('meetings').doc(id).get(),
            firestoreDb.collection('/users').doc(uid).collection('customers').doc(cid).get(),
            firestoreDb.collection('/users').doc(uid).collection('rates').doc(rid).get(),
            firestoreDb.collection('/stripe').doc(uid).get()
        ])

        // check for empty documents
        if (!userSnap.exists) {
            console.log('No such user!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        if (!jobSnap.exists) {
            console.log('No such job!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        if (!customerSnap.exists) {
            console.log('No such customer!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        if (!rateSnap.exists) {
            console.log('No such rate!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        if (!stripeSnap.exists) {
            console.log('No stripe credentials!') 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }

        //Verify that customer and rate id's match those of the job/meeting doc
        if (jobSnap.data().payer_id !== customerSnap.id) {
            console.log("cid given doesn't match payer_id for this job") 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }
        if (jobSnap.data().rate_id !== rateSnap.id) {
            console.log("rid given doesn't match rate_id for this job") 
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }


        const userDoc = userSnap.data();
        const user = {
            uid: uid,
            name: userDoc.displayName,
            email: userDoc.email,
        }
        const jobRecord = jobSnap.data();
        const customerRecord = customerSnap.data();
        const rateRecord = rateSnap.data();
        const stripeRecord = stripeSnap.data();

        // Create Stripe session
        const dateDescription = formatDateDescription(jobRecord)
        const rateDescription = formatRateDescription(rateRecord)
        const charge = rateRecord.rate * (jobRecord.d / 60) * 100
        const transfer = Math.round(charge - (60 + (charge * 4.9)/100))  //TODO: make sure we have a min charge so this is > 0

        const stripeSession = await stripe.checkout.sessions.create({
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
                setup_future_usage: 'on_session', 
                description: `${dateDescription} @ ${rateDescription} per hour`,
                transfer_data: {
                    destination: stripeRecord.stripe_user_id,
                    amount: transfer 
                }
            },
            customer: customerRecord.stripe_id,
            submit_type:  'book',
            success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://example.com/cancel',
        })

        return stripeSession

    } catch (error) {
        console.error("Error: ", error);
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
    }

}