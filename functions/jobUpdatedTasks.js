
exports.handler = function(change, context, firestoreDb, emailHandler) {
    console.log(change)
    const uid = context.params.uid;    
    const user = {
        uid: uid
    }

    currentJobDoc = change.before.data();
    newJobDoc = change.after.data();
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