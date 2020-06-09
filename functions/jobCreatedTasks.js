const moment = require('moment');


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


exports.handler = async function(snapshot, context, firestoreDb, emailHandler, taskHandler) {
    const uid = context.params.uid;    

    var jobDoc = snapshot.data();
    jobDoc.ref_id = context.params.meeting_id

    try {
        const {user, customerDoc, rateDoc} = await getSnaps(uid, jobDoc, firestoreDb)
        await emailHandler.sendAddJobProviderEmail(user, jobDoc, customerDoc, rateDoc)
        await emailHandler.sendAddJobClientEmail(user, jobDoc, customerDoc, rateDoc);

        const validToAuthDate = moment(jobDoc.t.toDate()).subtract(2, 'days')
        //  Send auth email immediately if job is < 2 days away and is not zero rate
        if (moment().isAfter(validToAuthDate) && rateDoc.rate !== 0) {
            await emailHandler.sendAuthorizeJobClientEmail(user, jobDoc, customerDoc, rateDoc);
        }
        if(rateDoc.rate !== 0) {
            // Don't send authorization reminders for $0 meetings
            await taskHandler.setAuthorizationReminders(user.uid, jobDoc.ref_id, jobDoc.t, firestoreDb)
        }
        await taskHandler.setMeetingReminders(user.uid, jobDoc.ref_id, jobDoc.t, firestoreDb)
        
        return true           

    } catch (error) {
        console.error("Error: ", error);
        return false
    }   

}
