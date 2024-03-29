const functions = require('firebase-functions');
const moment = require('moment');
const stripe = require('stripe')(functions.config().stripe.secretkey);



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



exports.handler = async function(data, context, firestoreDb, billing) {

    const id = data.id;
    const uid = data.uid;
    const cid = data.cid;
    const rid = data.rid;
    const invoiceId = data.invoice;

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

        //Verify that customer id and rate id match those of the job/meeting doc
        if (jobSnap.data().payer_id !== customerSnap.id) {
            console.log("cid given doesn't match payer_id for this job") 
            throw new functions.https.HttpsError('failed-precondition', 'Link no longer valid.');
        }
        if (jobSnap.data().rate_id !== rateSnap.id) {
            console.log("rid given doesn't match rate_id for this job") 
            throw new functions.https.HttpsError('failed-precondition', 'Link no longer valid.');
        }


        const jobRecord = jobSnap.data();
        const customerRecord = customerSnap.data();
        const rateRecord = rateSnap.data();
        const stripeRecord = stripeSnap.data();

        //Check to see if this item has already been paid
        if (jobRecord.status === 'paid') {
            return {sessionId: null, 
                    hasValidAuth: true, 
                    successMessage: "Your session has already been paid"}
        }

        //Check to see if there is already a valid paymentIntent for this job
        const needsAuth  = await billing.needsAuthorization(jobRecord, rateRecord)
        if (!needsAuth) {
            //TODO: better error message for users who click on old/expired links
            return {sessionId: null, 
                    hasValidAuth: true, 
                    successMessage: "Your session is already booked"}
        }
    
        // Create Stripe session
        const dateDescription = formatDateDescription(jobRecord)
        const rateDescription = formatRateDescription(rateRecord)

        let stripeSessionData = {
            payment_method_types: ['card'],
            line_items: [{
                name: `${jobRecord.topic} @ ${rateDescription} per hour.`,
                currency: rateRecord.currency.toLowerCase(),
                quantity: 1,
            }],
            payment_intent_data: {
                setup_future_usage: 'on_session', 
                description: `${dateDescription} @ ${rateDescription} per hour`,
                statement_descriptor_suffix: userSnap.data().displayName.slice(0,15),
                transfer_data: {
                    destination: stripeRecord.stripe_user_id,
                }
            },
            customer: customerRecord.stripe_id,
            client_reference_id: `${uid}|${id}|${invoiceId}`,
            submit_type: 'book',
            success_url: `${functions.config().ayuda.url}/authorize_success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: functions.config().ayuda.url,
        }

        if (invoiceId === null) {
            const charge = rateRecord.rate * (jobRecord.d / 60) * 100
            const transfer = billing.calculateTransfer(charge)
            stripeSessionData.line_items[0].amount = charge;
            stripeSessionData.payment_intent_data.transfer_data.amount = transfer;
            stripeSessionData.payment_intent_data.capture_method = 'manual';
            stripeSessionData.line_items[0].description = `${dateDescription}. Cancel any time. You will ` +
            `not be charged until your session is complete.`;
        } else {
            invoiceSnap = await firestoreDb.collection('/billing').doc(uid)
                .collection('meetings').doc(id).collection('invoices').doc(invoiceId).get()
            if (!invoiceSnap.exists) {
                console.log('No such invoice!') 
                throw new functions.https.HttpsError('failed-precondition', 'Unable to verify invoice.');
            }
            const invoiceDoc = invoiceSnap.data()
            stripeSessionData.line_items[0].amount = invoiceDoc.stripeCharge;
            stripeSessionData.payment_intent_data.transfer_data.amount = invoiceDoc.transfer;
            const sessionStarted = moment(invoiceDoc.meetingStarted.toDate()).tz(jobRecord.tz).format('MMMM Do')
            const sessionMinutes = (invoiceDoc.meetingLengthInSeconds/60).toFixed(2)
            stripeSessionData.line_items[0].description = `${sessionStarted} for ${sessionMinutes} minutes`;            
            stripeSessionData.payment_intent_data.description = 
                `${sessionStarted} @ ${rateDescription} per hour for ${sessionMinutes} minutes`;
            stripeSessionData.submit_type = 'pay';      
            stripeSessionData.success_url = 
                `${functions.config().ayuda.url}/authorize_success?session_id={CHECKOUT_SESSION_ID}&invoice=` +
                `${invoiceId}`;
            }

        const stripeSession = await stripe.checkout.sessions.create(stripeSessionData)

        return {sessionId: stripeSession.id, hasValidAuth: false}

    } catch (error) {
        console.error("Error: ", error);
        throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
    }

}