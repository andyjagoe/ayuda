const moment = require('moment');


async function getSnaps(uid, jobDoc, invoiceId, firestoreDb) {
    try {
        const [
            userSnap,
            customerSnap,
            rateSnap,
            invoiceSnap,
        ] = await Promise.all([
            firestoreDb.collection('/users').doc(uid).get(),            
            firestoreDb.collection('/users').doc(uid).collection('customers').doc(jobDoc.payer_id).get(),
            firestoreDb.collection('/users').doc(uid).collection('rates').doc(jobDoc.rate_id).get(),
            firestoreDb.collection('/billing').doc(uid).collection('meetings').doc(jobDoc.id)
                .collection('invoices').doc(invoiceId).get(),
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
        if (!invoiceSnap.exists) {
            console.log('No such invoice!') 
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
            invoiceDoc: invoiceSnap.data(),
        }

    } catch (error) {
        console.error("Error: ", error);
        return false
    }
}


exports.handler = async function(snapshot, context, firestoreDb, emailHandler) {
    const uid = context.params.uid;
    const meeting_id = context.params.meeting_id;

    const receipt = snapshot.data();

    try {
        const jobSnap = await firestoreDb
            .collection('/users')
            .doc(uid)
            .collection('meetings')
            .doc(meeting_id)
            .get()
        var jobDoc = jobSnap.data()
        jobDoc.id = jobSnap.id;
        const {user, customerDoc, rateDoc, invoiceDoc} = 
        await getSnaps(uid, jobDoc, receipt.invoiceId, firestoreDb)

        await emailHandler.sendReceiptJobClientEmail(user, jobDoc, customerDoc, rateDoc, receipt, invoiceDoc)
        await emailHandler.sendReceiptJobProviderEmail(user, jobDoc, customerDoc, rateDoc, receipt, invoiceDoc)    

        return true           

    } catch (error) {
        console.error("Error: ", error);
        return false
    }   

}
