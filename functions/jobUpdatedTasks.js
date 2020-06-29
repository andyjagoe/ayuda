const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secretkey);
const _ = require('lodash/core');
const moment = require('moment');



exports.handler = async function(change, context, firestoreDb, emailHandler, taskHandler, zoomHelper, 
        admin, billing) {

    const uid = context.params.uid;    
    var currentJobDoc = change.before.data();
    var newJobDoc = change.after.data();
    currentJobDoc.ref_id = context.params.meeting_id
    newJobDoc.ref_id = context.params.meeting_id

    //console.log(`currentJobDoc: ${JSON.stringify(currentJobDoc)}`);
    //console.log(`newJobDoc: ${JSON.stringify(newJobDoc)}`);

    // Check to see if this is a pending job that has been authorized
    if (currentJobDoc.status !== 'authorized' && newJobDoc.status === 'authorized') {
        //TODO: do we need to check validity of payment intent?

        try {
            const { user, newCustomerDoc, newRateDoc 
            } = await getSnaps( uid, currentJobDoc, newJobDoc, firestoreDb)

            await emailHandler.sendConfirmedJobClientEmail(user, newJobDoc, newCustomerDoc, newRateDoc)
            await emailHandler.sendConfirmedJobProviderEmail(user, newJobDoc, newCustomerDoc, newRateDoc);
            return null           
        } catch (error) {
            console.error("Error: ", error);
            return null
        }   
    }
    
    if (currentJobDoc.status !== 'completed' && newJobDoc.status === 'completed') {
        try {
            // 'completed' is after meeting ends provided both parties were on and min charge > $1
            await taskHandler.cancelAllReminders(uid, newJobDoc.ref_id, firestoreDb)        
            const when = admin.firestore.Timestamp.fromDate(new Date())
            await taskHandler.scheduleBillingForJob(uid, newJobDoc.ref_id, when, firestoreDb)

            //TODO: send emails that meeting has been completed

            return null           
        } catch (error) {
            console.log(`completed error: ${JSON.stringify(error)}`);
            console.error("Error: ", error);
            return null
        }   
    }

    if (currentJobDoc.status !== 'paid' && newJobDoc.status === 'paid') {
        try {
            const { user,  userDoc, newCustomerDoc, newRateDoc 
            } = await getSnaps( uid, currentJobDoc, newJobDoc, firestoreDb)

            await taskHandler.cancelAllReminders(uid, newJobDoc.ref_id, firestoreDb)        
            await zoomHelper.removeZoomMap(userDoc.zoomId, newJobDoc, firestoreDb)

            const { meetingLengthInSeconds, itemizedBillingSegments } = 
            await billing.calculateMeetingLength(uid, newJobDoc.ref_id, userDoc.zoomId, firestoreDb)
    
            const intent = await stripe.paymentIntents.retrieve(newJobDoc.payment_intent)
            const receipt =  {
                invoiceId: newJobDoc.invoiceId,
                description: intent.description,
                created: admin.firestore.Timestamp.fromDate(new Date()),
                billing_segments: itemizedBillingSegments,
                lengthInSeconds: meetingLengthInSeconds,
                rate: newRateDoc.rate,
                stripe_cust_id: intent.customer,
                cust_id: newJobDoc.payer_id,
                rate_id: newJobDoc.rate_id,
                topic: newJobDoc.topic,
                total_paid: intent.amount_received,
                provider_received: intent.transfer_data.amount,
                statement_descriptor: intent.charges.data[0].calculated_statement_descriptor,
                payment_method_details: intent.charges.data[0].payment_method_details,
            }
            const receiptResult = await firestoreDb.collection('/billing')
            .doc(uid)
            .collection('meetings')
            .doc(newJobDoc.ref_id)
            .collection("receipts")
            .add(receipt)

            // Receipt email sending handled by db listener for new receipts.

            return null           
        } catch (error) {
            console.error("Error: ", error);
            return null
        }   
    }

    if (currentJobDoc.status !== 'cancelled' && newJobDoc.status === 'cancelled') {
        try {
            const { user,  userDoc, newCustomerDoc, newRateDoc 
            } = await getSnaps( uid, currentJobDoc, newJobDoc, firestoreDb)

            await emailHandler.sendCancelJobProviderEmail(user, newJobDoc, newCustomerDoc, newRateDoc);
            await emailHandler.sendCancelJobClientEmail(user, newJobDoc, newCustomerDoc, newRateDoc);
            await taskHandler.cancelAllReminders(user.uid, newJobDoc.ref_id, firestoreDb)
            await zoomHelper.removeZoomMap(userDoc.zoomId, newJobDoc, firestoreDb)
    
            return null           
        } catch (error) {
            console.error("Error: ", error);
            return null
        }   
    }


    // Check if user facing values changed. If yes, trigger update emails
    const oldValues = {
        agenda: currentJobDoc.agenda,
        d: currentJobDoc.d,
        id: currentJobDoc.id,
        join_url: currentJobDoc.join_url,        
        password: currentJobDoc.password,
        payer_id: currentJobDoc.payer_id,
        rate_id: currentJobDoc.rate_id,
        start_url: currentJobDoc.start_url,
        t: currentJobDoc.t,
        topic: currentJobDoc.topic,
        tz: currentJobDoc.tz,
    };
    const newValues = {
        agenda: newJobDoc.agenda,
        d: newJobDoc.d,
        id: newJobDoc.id,
        join_url: newJobDoc.join_url,        
        password: newJobDoc.password,
        payer_id: newJobDoc.payer_id,
        rate_id: newJobDoc.rate_id,
        start_url: newJobDoc.start_url,
        t: newJobDoc.t,
        topic: newJobDoc.topic,
        tz: newJobDoc.tz,
    }
    if (_.isEqual(oldValues, newValues)) {
        // No values that should trigger an email update have changed
        return false
    }


    try {
        const { user,
                currentCustomerDoc, 
                newCustomerDoc, 
                currentRateDoc, 
                newRateDoc
        } = await getSnaps( uid, currentJobDoc, newJobDoc, firestoreDb)

        await emailHandler.sendChangeJobProviderEmail(
            user, 
            currentJobDoc,
            newJobDoc,
            currentCustomerDoc, 
            newCustomerDoc,
            currentRateDoc,
            newRateDoc
        );

        if  (currentJobDoc.payer_id !== newJobDoc.payer_id) {
            // If customer was switched, send new job notice to new customer
            await emailHandler.sendAddJobClientEmail(user, newJobDoc, newCustomerDoc, newRateDoc);
            await emailHandler.sendCancelJobClientEmail(user, currentJobDoc, currentCustomerDoc, currentRateDoc);
        } else {
            await emailHandler.sendChangeJobClientEmail(
                user, 
                currentJobDoc,
                newJobDoc,
                currentCustomerDoc, 
                newCustomerDoc,
                currentRateDoc,
                newRateDoc
            );
        }
        

        // Determine whether we need to send auth request emails
        const validToAuthDate = moment(newJobDoc.t.toDate()).subtract(2, 'days')
        if (moment().isAfter(validToAuthDate) && newRateDoc.rate !== 0) {
            // Check paymentIntent and whether sufficient $ is authorized. If not, send auth request. 
            const needsAuth  = await billing.needsAuthorization(newJobDoc, newRateDoc)
            if (needsAuth) {
                await emailHandler.sendAuthorizeJobClientEmail(user, newJobDoc, newCustomerDoc, newRateDoc);
            }
        }


        // Determine whether we need to update reminders for the job
        if (!moment(currentJobDoc.t.toDate()).isSame(moment(newJobDoc.t.toDate()))) {
            console.log(`Start time has changed. Need to update reminder tasks`)
            await taskHandler.cancelAllReminders(user.uid, currentJobDoc.ref_id, firestoreDb) 
            if(newRateDoc.rate !== 0) {
                await taskHandler.setAuthorizationReminders(user.uid, newJobDoc.ref_id, newJobDoc.t, firestoreDb)
            }
            await taskHandler.setMeetingReminders(user.uid, newJobDoc.ref_id, newJobDoc.t, firestoreDb)
        }


    } catch (error) {
        console.error("Error: ", error);
        return false
    }


    return true
}


const getSnaps = async (uid, currentJobDoc, newJobDoc, firestoreDb) => {
    try {
        const [
            userSnap,
            currentCustomerSnap,
            newCustomerSnap,
            currentRateSnap,
            newRateSnap        
        ] = await Promise.all([
            firestoreDb.collection('/users').doc(uid).get(),
            firestoreDb.collection('/users').doc(uid).collection('customers').doc(currentJobDoc.payer_id).get(),
            firestoreDb.collection('/users').doc(uid).collection('customers').doc(newJobDoc.payer_id).get(),
            firestoreDb.collection('/users').doc(uid).collection('rates').doc(currentJobDoc.rate_id).get(),
            firestoreDb.collection('/users').doc(uid).collection('rates').doc(newJobDoc.rate_id).get(),
        ])

        // check for empty documents
        if (!userSnap.exists) {
            console.log('No such user!')
            return false
        }
        if (!currentCustomerSnap.exists) {
            console.log('No such customer (current)!') 
            return false
        }
        if (!newCustomerSnap.exists) {
            console.log('No such customer (new)!') 
            return false
        }
        if (!currentRateSnap.exists) {
            console.log('No such rate (current)!') 
            return false
        }
        if (!newRateSnap.exists) {
            console.log('No such rate (new)!') 
            return false
        }

        const user = {
            uid: uid,
            name: userSnap.data().displayName,
            email: userSnap.data().email,
        }    
        var currentCustomerDoc = currentCustomerSnap.data()
        currentCustomerDoc.id = currentCustomerSnap.id;
        var newCustomerDoc = newCustomerSnap.data()
        newCustomerDoc.id = newCustomerSnap.id;
        var currentRateDoc = currentRateSnap.data()
        currentRateDoc.id = currentRateSnap.id;
        var newRateDoc = newRateSnap.data()
        newRateDoc.id = newRateSnap.id;

        return {
            user: user,
            userDoc: userSnap.data(),
            currentCustomerDoc: currentCustomerDoc,
            newCustomerDoc: newCustomerDoc,
            currentRateDoc: currentRateDoc,
            newRateDoc: newRateDoc,
        }
    } catch (error) {
        console.error("Error: ", error);
        return false
    }
}
