const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secretkey);
const endpointSecret = functions.config().stripe.endpointsecret;


exports.handler = async function(req, res, firestoreDb, admin) {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    switch (event.type) {
        case 'checkout.session.completed':
            console.log('checkout.session.completed')
            await handleCheckoutSucceeded(
                event.data.object.payment_intent, 
                event.data.object.client_reference_id,
                firestoreDb,
                admin
            )
            break;
        case 'payout.paid':
            console.log('payout.paid')
            console.log(JSON.stringify(event.data))
            break;
        default:
            // Unexpected event type
            return res.status(400).end();
    }

    // Return a response to acknowledge receipt of the event
    return res.json({received: true});
    
}

const handleCheckoutSucceeded = async (paymentIntent, client_reference_id, firestoreDb, admin) => {
    const [uid, job_id, invoiceId] = client_reference_id.split('|')

    try {
        const intent = await stripe.paymentIntents.retrieve(paymentIntent)
        let status = 'authorized'
        let updateData = {
            payment_intent: paymentIntent,
            payment_intent_t: admin.firestore.Timestamp.fromDate(new Date()),
            invoiceId: invoiceId,
            status: status
        }

        if (intent.capture_method === 'automatic') {
            updateData.status = 'paid'
            updateData.invoiceId = invoiceId
        } 

        await firestoreDb.collection('/users')
        .doc(uid)
        .collection('meetings')
        .doc(job_id)
        .set(updateData, { merge: true })

        return true
    } catch (error) {
        console.error("Error: ", error);
        return false
    }
}