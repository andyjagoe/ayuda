
const _ = require('lodash/core');


exports.handler = function(change, context, firestoreDb, emailHandler) {
    var currentJobDoc = change.before.data();
    var newJobDoc = change.after.data();

    // Check to see if this is a pending job that has been authorized
    if (currentJobDoc.status === 'pending' && newJobDoc.status === 'authorized') {
        console.log(`Authorization of pending job. PaymentIntent: ${newJobDoc.payment_intent}`)

        //TODO: check validity of payment intent and send emails to provider and client
        return false
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

    const uid = context.params.uid;    
    const user = {
        uid: uid
    }

    currentJobDoc.ref_id = context.params.meeting_id
    newJobDoc.ref_id = context.params.meeting_id
    var currentCustomerDoc = null;
    var newCustomerDoc = null;
    var currentRateDoc = null;
    var newRateDoc = null;

    return firestoreDb.collection('/users')
    .doc(uid)
    .get()
    .then(doc => {
        if (!doc.exists) {
            console.log('No such user!');
            return false;
        }
        const userDoc = doc.data();
        user.name = userDoc.displayName;
        user.email = userDoc.email
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('customers')
            .doc(currentJobDoc.payer_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such customer!');
            return false;
        }
        currentCustomerDoc = doc.data();
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('customers')
            .doc(newJobDoc.payer_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such customer!');
            return false;
        }
        newCustomerDoc = doc.data();
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('rates')
            .doc(currentJobDoc.rate_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such customer!');
            return false;
        }
        currentRateDoc = doc.data();
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('rates')
            .doc(newJobDoc.rate_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such rate!');
            return false;
        }
        newRateDoc = doc.data();
        return emailHandler.sendChangeJobProviderEmail(
            user, 
            currentJobDoc,
            newJobDoc,
            currentCustomerDoc, 
            newCustomerDoc,
            currentRateDoc,
            newRateDoc
        );
    })
    .then(result => {
        console.log('Update job email has been sent to provider');        
        return true;
    })
    .catch(error => {
        console.error("Error: ", error);
        return false;
    });

}