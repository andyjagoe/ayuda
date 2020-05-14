const moment = require('moment');

exports.handler = function(snapshot, context, firestoreDb, emailHandler) {
    const uid = context.params.uid;    
    const user = {
        uid: uid
    }

    jobDoc = snapshot.data();
    jobDoc.ref_id = context.params.meeting_id
    var customerDoc = null;
    var rateDoc = null;

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
            .doc(jobDoc.payer_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such customer!');
            return false;
        }
        customerDoc = doc.data();
        customerDoc.id = doc.id;
        return firestoreDb.collection('/users')
            .doc(uid)
            .collection('rates')
            .doc(jobDoc.rate_id)
            .get();
    })
    .then(doc => {
        if (!doc.exists) {
            console.log('No such rate!');
            return false;
        }
        rateDoc = doc.data();
        rateDoc.id = doc.id;
        return emailHandler.sendAddJobProviderEmail(user, jobDoc, customerDoc, rateDoc);
    })
    .then(result => {
        //console.log('Add job email sent to provider');
        return emailHandler.sendAddJobClientEmail(user, jobDoc, customerDoc, rateDoc);
    })
    .then(result => {
        //console.log('Add job email sent to client');
        const validToAuthDate = moment(jobDoc.t.toDate()).subtract(6, 'days') // Auth valid  up to 7 days
        // Only send auth email if job  is with in 6 days and is not zero rate
        if (moment().isAfter(validToAuthDate) && rateDoc.rate !== 0) {
            return emailHandler.sendAuthorizeJobClientEmail(user, jobDoc, customerDoc, rateDoc);    
        }
        return true;
    })
    .catch(error => {
        console.error("Error: ", error);
        return false;
    });

}
