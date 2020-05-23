const _ = require('lodash/core');
const moment = require('moment');
const stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');


async function getSnaps(uid, currentJobDoc, newJobDoc, firestoreDb) {
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


exports.handler = async function(change, context, firestoreDb, emailHandler, taskHandler) {
    var currentJobDoc = change.before.data();
    var newJobDoc = change.after.data();
    currentJobDoc.ref_id = context.params.meeting_id
    newJobDoc.ref_id = context.params.meeting_id
    const uid = context.params.uid;    


    // Check to see if this is a pending job that has been authorized
    if (currentJobDoc.status === 'pending' && newJobDoc.status === 'authorized') {
        //TODO: do we need to check validity of payment intent?

        try {
            const { user, newCustomerDoc, newRateDoc 
            } = await getSnaps( uid, currentJobDoc, newJobDoc, firestoreDb)

            await emailHandler.sendConfirmedJobClientEmail(user, newJobDoc, newCustomerDoc, newRateDoc)
            await emailHandler.sendConfirmedJobProviderEmail(user, newJobDoc, newCustomerDoc, newRateDoc);
            return true           
        } catch (error) {
            console.error("Error: ", error);
            return false
        }   
    }
    
    if (currentJobDoc.status !== 'completed' && newJobDoc.status === 'completed') {
        try {
            await taskHandler.cancelAllReminders(uid, newJobDoc.ref_id, firestoreDb)
            
            //TODO: enable removing zoom map when we have option to run billing
            //await zoomHelper.removeZoomMap(hostZoomId, jobDoc, firestoreDb)

            return true           
        } catch (error) {
            console.error("Error: ", error);
            return false
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
            const needsAuth  = await needsAuthorization(newJobDoc, newRateDoc)
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