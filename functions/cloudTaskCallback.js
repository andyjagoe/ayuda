

exports.handler = async function(req, res, firestoreDb, emailHandler, admin, zoomHelper, taskHandler, billing) {
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
                const needsAuth  = await billing.needsAuthorization(jobDoc, rateDoc)
                if (needsAuth) {
                    await emailHandler.sendAuthorizeJobClientEmail(user, jobDoc, customerDoc, rateDoc)
                }                    
            }
            break;
        case 'reminder.auth.4day':
            {
                console.log('reminder.auth.4day')
                const {user, jobDoc, customerDoc, rateDoc} = await getSnaps(uid, id, firestoreDb)
                const needsAuth  = await billing.needsAuthorization(jobDoc, rateDoc)
                if (needsAuth) {
                    await emailHandler.sendAuthorizeJobClientEmail(user, jobDoc, customerDoc, rateDoc)
                }                    
            }
            break;
        case 'reminder.auth.2day':
            {
                console.log('reminder.auth.2day')
                const {user, jobDoc, customerDoc, rateDoc} = await getSnaps(uid, id, firestoreDb)
                const needsAuth  = await billing.needsAuthorization(jobDoc, rateDoc)
                if (needsAuth) {
                    await emailHandler.sendAuthorizeJobClientEmail(user, jobDoc, customerDoc, rateDoc)
                }                    
            }
            break;
        case 'task.billing.standard':
            {
                console.log('task.billing.standard')
                const { user, userDoc, jobDoc, customerDoc, rateDoc } = await getSnaps(uid, id, firestoreDb)
                await billing.runBilling(user, id, userDoc.zoomId, jobDoc, customerDoc, rateDoc, 
                    firestoreDb, emailHandler, admin, billing)
            }
            break;
        case 'task.meeting.completed':
            {
                console.log('task.meeting.completed')
                const { userDoc, rateDoc } = await getSnaps(uid, id, firestoreDb)
                await handleMeetingCompleted(uid, id, userDoc.zoomId, rateDoc, firestoreDb, billing)
            }
            break;
        default:
            // Unexpected type
            return res.status(400).end();
    }

    return res.sendStatus(200)    
}



const handleMeetingCompleted = async (uid, jobId, zoomId, rateDoc, firestoreDb, billing) => {
    
    try {
        const isbillable = await billing.isBillable(uid, jobId, zoomId, rateDoc, firestoreDb)
        if (isbillable === true) {
            await firestoreDb.collection('/users')
            .doc(uid)
            .collection('meetings')
            .doc(jobId)
            .set({
                status: 'completed'
            }, { merge: true })
        }

    } catch (error) {
        console.error(error);
        console.log(`handleMeetingCompleted Error: ${JSON.stringify(error)}`)
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