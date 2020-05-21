const functions = require('firebase-functions');
const moment = require('moment');
const _ = require('lodash');
const stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');


exports.handler = async function(req, res, firestoreDb, emailHandler) {
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
                const { userDoc, rateDoc } = await getSnaps(uid, id, firestoreDb)
                await calculateBilling(uid, id, userDoc.zoomId, rateDoc, firestoreDb)
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


async function calculateBilling(uid, jobId, hostZoomId, rateDoc, firestoreDb) {
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

        var meetingLengthInSeconds = 0
        if  (bothOnStartTimes.length === bothOnEndTimes.length) {
            for (i = 0; i < bothOnEndTimes.length; i++) {
                const t = bothOnEndTimes[i].when.diff(bothOnStartTimes[i].when, 'seconds')
                meetingLengthInSeconds = meetingLengthInSeconds + t                 
            }    
        }
        console.log(`Meeting length in seconds: ${meetingLengthInSeconds}`)

        // Calculate charges based on hourly rate and length of meeting
        const charge = (meetingLengthInSeconds  / 3600) * rateDoc.rate
        const stripeCharge = Math.round(charge * 100)
        console.log(`Rate: ${rateDoc.rate} Charge: ${charge} stripeCharge: ${stripeCharge}`)

        // Capture charge due

        // Send emails to provider and client

        return true
    } catch (error) {
        console.error(error);
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