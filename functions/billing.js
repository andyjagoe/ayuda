const moment = require('moment');
const _ = require('lodash');
const stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');



const getJobStatus = async (uid, jobId, firestoreDb) => {
    try {
        const jobSnap = await firestoreDb.collection('/users')
        .doc(uid)
        .collection('meetings')
        .doc(jobId)
        .get()

        return jobSnap.data().status
    } catch (error) {
        console.error(error);
        console.log(`getJobStatus Error: ${JSON.stringify(error)}`)
        throw error
    }    
}


const needsAuthorization = async (jobDoc, rateDoc) => {
    if (!('payment_intent' in jobDoc)) {
        return true
    }
    const intent = await stripe.paymentIntents.retrieve(jobDoc.payment_intent)            
    if (intent.amount_capturable < rateDoc.rate * (jobDoc.d / 60) * 100) {
        return true
    }
    return false
}


const isBillable = async (uid, jobId, zoomId, rateDoc, firestoreDb) => {
    try {
        const { meetingLengthInSeconds } = await calculateMeetingLength(uid, jobId, zoomId, firestoreDb)
        const charge = (meetingLengthInSeconds  / 3600) * rateDoc.rate
        if (charge < 1) {
            console.error(`Minimum charge of $1 not met: ${charge}`)
            //TODO: in future consider emailing provider to say minimum meeting charge not met?
            return false
        }

        return true
    } catch (error) {
        throw error
    } 
}


const runBilling  = async (user, jobId, hostZoomId, jobDoc, customerDoc, rateDoc, 
    firestoreDb, emailHandler, admin, billing) => {
    try {
        // check that this item is eligible for billing
        const status = await getJobStatus(user.uid, jobId, firestoreDb)
        if (status === 'paid') {
            throw new Error('This job has already been paid.')
        }
        if (status === 'cancelled') {
            throw new Error('This job has been cancelled.')
        }
        if (!(await isBillable(user.uid, jobId, hostZoomId, rateDoc, firestoreDb))) {
            throw new Error('This job does not meet minimum billing threshold.')
        }


        const { meetingLengthInSeconds, itemizedBillingSegments } = 
        await billing.calculateMeetingLength(user.uid, jobId, hostZoomId, firestoreDb)


        const charge = (meetingLengthInSeconds  / 3600) * rateDoc.rate
        const stripeCharge = Math.round(charge * 100)
        const transfer = Math.round(stripeCharge - (60 + (stripeCharge * 4.9)/100))
        console.log(`Rate: ${rateDoc.rate} Charge: ${charge} stripeCharge: ${stripeCharge}`)

        const stripeSnap = await firestoreDb.collection('/stripe').doc(user.uid).get()
        if (!stripeSnap.exists) {
            console.error('No stripe credentials!') 
            //TODO: kick off action to correct no provider stripe credentials
            return false
        }

        if  (!('payment_intent' in jobDoc)) {
            console.log(`We have no authorization for job: ${JSON.stringify(jobDoc)}`)
            //TODO: kick off authorization/payment request to client
            return false
        }

        const intent = await stripe.paymentIntents.retrieve(jobDoc.payment_intent)            
        //console.log(`PaymentIntent: ${JSON.stringify(intent)}`)

        if (intent.status === 'succeeded') {
            console.error(`This transaction has already been processed: ${intent.status}`)
            //TODO: send out request for new payment/authorization
            return false
        } else if (intent.status !== 'requires_capture') {
            console.error(`Unexpected status: ${intent.status}`)
            //TODO: send out request for new payment/authorization
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
        console.log(`handleMeetingEnded Error: ${JSON.stringify(error)}`)
        throw error
    }  
}



const calculateMeetingLength = async (uid, jobId, zoomId, firestoreDb) => {
    try {
        const events = await firestoreDb.collection('/billing')
            .doc(uid)
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
                if(doc.data().participant.id === zoomId) {
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
                if(doc.data().participant.id === zoomId) {
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

        if  (bothOnStartTimes.length !== bothOnEndTimes.length) {
            console.error(`Error processing meeting times. bothOnStartTimes: ${JSON.stringify(bothOnStartTimes)} ` +
                `bothOnEndTimes: ${JSON.stringify(bothOnEndTimes)}`)
            throw new Error('Error processing meeting times. Number of start times does not match end times')
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
        //console.log(`meetingLengthInSeconds: ${meetingLengthInSeconds}`)
        //console.log(`itemizedBillingSegments: ${JSON.stringify(itemizedBillingSegments)}`)

        return {
            meetingLengthInSeconds: meetingLengthInSeconds,
            itemizedBillingSegments: itemizedBillingSegments,
        }
    
    } catch (error) {
        throw error
    }        
    
}

module.exports = {
    needsAuthorization,
    calculateMeetingLength,
    isBillable,
    runBilling,
}