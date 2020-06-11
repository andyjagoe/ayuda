const functions = require('firebase-functions');
const stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');
const endpointSecret = 'whsec_wKTP8VhOGpyFV37lvjNZ5ExHoImAkq54';


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
            //console.log(event.data)
            await handleCheckoutSucceeded(
                event.data.object.payment_intent, 
                event.data.object.client_reference_id, 
                firestoreDb,
                admin
            )
            break;
        default:
            // Unexpected event type
            return res.status(400).end();
    }

    // Return a response to acknowledge receipt of the event
    return res.json({received: true});
    
}

function handleCheckoutSucceeded(paymentIntent, client_reference_id, firestoreDb, admin) {
    const [uid, job_id] = client_reference_id.split('|')
    return firestoreDb.collection('/users')
    .doc(uid)
    .collection('meetings')
    .doc(job_id)
    .set({
        payment_intent: paymentIntent,
        payment_intent_t: admin.firestore.Timestamp.fromDate(new Date()),
        status: 'authorized'
    }, { merge: true })
    .then(ref => {
        console.log('Job successfully updated');
        return true;
    })
    .catch(error => {
        console.error("updateJob Error: ", error);
        return false;
    });
}