const functions = require('firebase-functions');
const moment = require('moment');
const _ = require('lodash');
const stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');


exports.handler = async function(req, res, firestoreDb, emailHandler, admin) {
    //console.log(req.body.data)
    const id = req.body.data.id;
    const uid = req.body.data.uid;

    switch (req.body.type) {
        case 'reminder.meeting.30min':
            {
                console.log('reminder.meeting.30min')
                const {user, jobDoc, customerDoc, rateDoc} = await getSnaps(uid, id, firestoreDb)
                await emailHandler.sendReminderJobProviderEmail(user, jobDoc, customerDoc, rateDoc, '30min')
                await emailHandler.sendReminderJobClientEmail(user, jobDoc, customerDoc, rateDoc, '30min')
            }
            break;
        case 'reminder.meeting.24hour':
            {
                console.log('reminder.meeting.24hour')
                const {user, jobDoc, customerDoc, rateDoc} = await getSnaps(uid, id, firestoreDb)
                await emailHandler.sendReminderJobProviderEmail(user, jobDoc, customerDoc, rateDoc, '24hour')
                await emailHandler.sendReminderJobClientEmail(user, jobDoc, customerDoc, rateDoc, '24hour')
            }
            break;
        case 'reminder.auth.6day':
            {
                console.log('reminder.auth.6day')
                const {user, jobDoc, customerDoc, rateDoc} = await getSnaps(uid, id, firestoreDb)
                const needsAuth  = await needsAuthorization(jobDoc, rateDoc)
                if (needsAuth) {
                    await emailHandler.sendAuthorizeJobClientEmail(user, jobDoc, customerDoc, rateDoc)
                }                    
            }
            break;
        case 'reminder.auth.4day':
            {
                console.log('reminder.auth.4day')
                const {user, jobDoc, customerDoc, rateDoc} = await getSnaps(uid, id, firestoreDb)
                const needsAuth  = await needsAuthorization(jobDoc, rateDoc)
                if (needsAuth) {
                    await emailHandler.sendAuthorizeJobClientEmail(user, jobDoc, customerDoc, rateDoc)
                }                    
            }
            break;
        case 'reminder.auth.2day':
            {
                console.log('reminder.auth.2day')
                const {user, jobDoc, customerDoc, rateDoc} = await getSnaps(uid, id, firestoreDb)
                const needsAuth  = await needsAuthorization(jobDoc, rateDoc)
                if (needsAuth) {
                    await emailHandler.sendAuthorizeJobClientEmail(user, jobDoc, customerDoc, rateDoc)
                }                    
            }
            break;
        case 'task.billing.standard':
            {
                console.log('task.billing.standard')
                const { user, userDoc, jobDoc, customerDoc, rateDoc } = await getSnaps(uid, id, firestoreDb)
                await calculateBilling(user, id, userDoc.zoomId, jobDoc, customerDoc, rateDoc, 
                    firestoreDb, emailHandler, admin)
                // 2. Remove zoom_map entries for this meeting (instead of in jobDeleteTasks)
            }
            break;
        default:
            // Unexpected type
            return res.status(400).end();
    }

    return res.sendStatus(200)    
}


async function needsAuthorization (jobDoc, rateDoc) {
    if (!('payment_intent' in jobDoc)) {
        return true
    }
    const intent = await stripe.paymentIntents.retrieve(jobDoc.payment_intent)            
    if (intent.amount_capturable < rateDoc.rate * (jobDoc.d / 60) * 100) {
        return true
    }
    return false
}



async function calculateBilling(user, jobId, hostZoomId, jobDoc, customerDoc, rateDoc, 
    firestoreDb, emailHandler, admin) {
    try {
        // get all events from the job
        const events = await firestoreDb.collection('/billing')
            .doc(user.uid)
            .collection('meetings')
            .doc(jobId)
            .collection('events')
            .orderBy('when')
            .get()
        
        var hostOn = false
        var clientOn = false
        var clientIds = []
        var bothOnStartTimes = []
        var bothOnEndTimes = []

        for (doc of events.docs) {
            //console.log(`Event: ${doc.id} ${JSON.stringify(doc.data())}`)
            if (doc.data().type  === 'meeting.participant_joined') {
                if(doc.data().participant.id === hostZoomId) {
                    if (hostOn === false && clientOn === true) {
                        bothOnStartTimes.push({type:"start_time", when:moment(doc.data().when.toDate())} )
                    }
                    hostOn = true
                } else {
                    if (hostOn === true && clientOn === false) {
                        bothOnStartTimes.push({type:"start_time", when:moment(doc.data().when.toDate())} )
                    }
                    clientOn = true
                    clientIds.push(doc.data().participant.user_id)
                }
            } else if (doc.data().type  === 'meeting.participant_left') {
                if(doc.data().participant.id === hostZoomId) {
                    if (hostOn === true && clientOn === true) {
                        bothOnEndTimes.push({type:"end_time", when:moment(doc.data().when.toDate())} )
                    }
                    hostOn = false
                } else {
                    _.pull(clientIds, doc.data().participant.user_id);
                    if (hostOn === true && clientOn === true && clientIds.length === 0) {
                        bothOnEndTimes.push({type:"end_time", when:moment(doc.data().when.toDate())} )
                    }
                    if (clientIds.length === 0){
                        clientOn = false
                    }
                }
            }
        }

        // Verify we have a valid data set of start and end times
        if  (bothOnStartTimes.length !== bothOnEndTimes.length) {
            console.error(`Error processing meeting times. bothOnStartTimes: ${bothOnStartTimes} ` +
                `bothOnEndTimes: ${bothOnEndTimes}`)
            return false
        }

        var meetingLengthInSeconds = 0
        var itemizedBillingSegments = []
        // Calculate meeting length in seconds
        for (i = 0; i < bothOnEndTimes.length; i++) {
            const t = bothOnEndTimes[i].when.diff(bothOnStartTimes[i].when, 'seconds')
            meetingLengthInSeconds = meetingLengthInSeconds + t
            itemizedBillingSegments.push({
                start_time: bothOnStartTimes[i].when,
                end_time: bothOnEndTimes[i].when,
                duration: t,
            })
        }  
        console.log(`Meeting length in seconds: ${meetingLengthInSeconds}`)

        // Calculate charges based on hourly rate and length of meeting
        const charge = (meetingLengthInSeconds  / 3600) * rateDoc.rate

        //Check that charge exceeds minimum of $1
        if (charge < 1) {
            console.error(`Minimum charge of $1 not met: ${charge}`)
            //TODO: in future consider emailing provider to say minimum meeting charge not met?
            return false
        }

        // Mark jobRecord as completed
        await firestoreDb.collection('/users')
        .doc(user.uid)
        .collection('meetings')
        .doc(jobId)
        .set({
            status: 'completed'
        }, { merge: true })
        

        // Convert amount into format Stripe uses without decimals
        const stripeCharge = Math.round(charge * 100)

        // Calculate share transferred to provider after our service fee
        const transfer = Math.round(stripeCharge - (60 + (stripeCharge * 4.9)/100)) //TODO: make sure we have a min charge so this is > 0
        console.log(`Rate: ${rateDoc.rate} Charge: ${charge} stripeCharge: ${stripeCharge}`)

        // Check that the provider is setup with Stripe account
        const stripeSnap = await firestoreDb.collection('/stripe').doc(user.uid).get()
        if (!stripeSnap.exists) {
            console.error('No stripe credentials!') 
            //TODO: kick off action to correct no provider stripe credentials
            return false
        }

        //TODO: If the meeting does not have a payment authorization, send an email invoice for payment
        if  (!('payment_intent' in jobDoc)) {
            console.log(`We have no authorization for job: ${JSON.stringify(jobDoc)}`)
            //TODO: kick off authorization/payment request to client
            return false
        }

        // If the meeting has a payment authorization, retrieve it
        const intent = await stripe.paymentIntents.retrieve(jobDoc.payment_intent)            
        //console.log(`PaymentIntent: ${JSON.stringify(intent)}`)

        // Verify payment authorization is valid
        if (intent.status === 'succeeded') {
            console.error(`This transaction has already been processed: ${intent.status}`)
            //TODO: send out request for new payment/authorization
            return false
        } else if (intent.status !== 'requires_capture') {
            console.error(`Unexpected status: ${intent.status}`)
            //TODO: error and return
            return false
        }

        if (intent.amount_capturable < stripeCharge)  {
            console.error(`Authorization insufficient ${intent.amount_capturable} < ${stripeCharge}`)
            //TODO: send out request for new payment/authorization
            return false
        }

        // Collect payment
        const payment = await stripe.paymentIntents.capture(
            jobDoc.payment_intent,
            {amount_to_capture: stripeCharge,
            transfer_data: {
                amount: transfer
            }}
        )
        console.log(`Payment successful: ${payment.description}: ` +
            `${payment.amount_received} total - ${payment.amount_received - payment.transfer_data.amount} fee ` +
            ` = ${payment.transfer_data.amount} `)

        // Mark jobRecord as paid
        await firestoreDb.collection('/users')
        .doc(user.uid)
        .collection('meetings')
        .doc(jobId)
        .set({
            status: 'paid'
        }, { merge: true })

        //TODO: Prevent future charges for this job. -> remove zoom mapping meeting-ended event will not generate no billings?
        
        // Store record of payment with details needed for a receipt
        const receipt =  {
            description: payment.description,
            created: admin.firestore.Timestamp.fromDate(new Date()),
            billing_segments: itemizedBillingSegments,
            lengthInSeconds: meetingLengthInSeconds,
            rate: rateDoc.rate,
            stripe_cust_id: payment.customer,
            cust_id: jobDoc.payer_id,
            rate_id: jobDoc.rate_id,
            topic: jobDoc.topic,
            total_paid: payment.amount_received,
            provider_received: payment.transfer_data.amount,
            statement_descriptor: payment.charges.data[0].calculated_statement_descriptor,
            payment_method_details: payment.charges.data[0].payment_method_details,
        }
        const receiptResult = await firestoreDb.collection('/billing')
        .doc(user.uid)
        .collection('meetings')
        .doc(jobId)
        .collection("receipts")
        .add(receipt)

        //console.log(`Receipt: ${JSON.stringify(receiptResult)} ${JSON.stringify(receipt)}`)
        //console.log(`Receipt Id: ${JSON.stringify(receiptResult.id)}`)
        //console.log(`paymentResult: ${JSON.stringify(payment)}`)

        // Send receipt/processed emails to provider and client
        await emailHandler.sendReceiptJobClientEmail(user, jobDoc, customerDoc, rateDoc, receipt, receiptResult.id)
        await emailHandler.sendReceiptJobProviderEmail(user, jobDoc, customerDoc, rateDoc, receipt, receiptResult.id)
        
        //TODO: error checking that email sent successfully

        return true
    } catch (error) {
        console.error(error);
        console.log(`calculateBilling Error: ${JSON.stringify(error)}`)
        return false
    }
}


async function getSnaps(uid, jobId, firestoreDb) {
    if (!(typeof jobId === 'string') || jobId.length === 0) {
        console.log('The function must be called with one argument "id".') 
        return false;
    }
    if (!(typeof uid === 'string') || uid.length === 0) {
        console.log('The function must be called with one argument "uid".') 
        return false;      
    }

    try {
        const jobSnap = await firestoreDb.collection('/users')
                                        .doc(uid)
                                        .collection('meetings')
                                        .doc(jobId)
                                        .get()

        if (!jobSnap.exists) {
            console.log('No such job!')
            return false
        }
        var jobDoc = jobSnap.data()
        jobDoc.ref_id = jobSnap.id;
                                
        const [
            userSnap,
            customerSnap,
            rateSnap,
        ] = await Promise.all([
            firestoreDb.collection('/users').doc(uid).get(),
            firestoreDb.collection('/users').doc(uid).collection('customers').doc(jobDoc.payer_id).get(),
            firestoreDb.collection('/users').doc(uid).collection('rates').doc(jobDoc.rate_id).get(),
        ])

        // check for empty documents
        if (!userSnap.exists) {
            console.log('No such user!')
            return false
        }
        if (!customerSnap.exists) {
            console.log('No such customer (current)!') 
            return false
        }
        if (!rateSnap.exists) {
            console.log('No such rate (current)!') 
            return false
        }


        const user = {
            uid: uid,
            name: userSnap.data().displayName,
            email: userSnap.data().email,
        }
        var customerDoc = customerSnap.data()
        customerDoc.id = customerSnap.id;
        var rateDoc = rateSnap.data()
        rateDoc.id = rateSnap.id;

        return {
            user: user,
            userDoc: userSnap.data(),
            jobDoc: jobDoc,
            customerDoc: customerDoc,
            rateDoc: rateDoc,
        }

        } catch (error) {
            console.error("Error: ", error);
            return false
        }
}