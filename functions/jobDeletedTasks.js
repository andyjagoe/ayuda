
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
        return emailHandler.sendCancelJobProviderEmail(user, jobDoc, customerDoc, rateDoc);
    })
    .then(result => {
        //console.log('Add job email has been sent to client');        
        return true;
    })
    .catch(error => {
        console.error("Error: ", error);
        return false;
    });

}