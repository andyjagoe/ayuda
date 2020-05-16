
exports.handler = async function(snapshot, context, firestoreDb, emailHandler, taskHandler) {
    const uid = context.params.uid;    

    var jobDoc = snapshot.data();
    jobDoc.ref_id = context.params.meeting_id

    try {
        const {user, customerDoc, rateDoc} = await getSnaps(uid, jobDoc, firestoreDb)
        await emailHandler.sendCancelJobProviderEmail(user, jobDoc, customerDoc, rateDoc);
        await emailHandler.sendCancelJobClientEmail(user, jobDoc, customerDoc, rateDoc);
        await taskHandler.cancelAllReminders(user, jobDoc.ref_id, firestoreDb) 

        return true           

    } catch (error) {
        console.error("Error: ", error);
        return false
    }   

}



async function getSnaps(uid, jobDoc, firestoreDb) {
    try {
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
            customerDoc: customerDoc,
            rateDoc: rateDoc,
        }

    } catch (error) {
        console.error("Error: ", error);
        return false
    }
}
