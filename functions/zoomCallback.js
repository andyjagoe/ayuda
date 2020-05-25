const zoomVerificationToken = 'ZLXFn9VjQS2cHoG_y0_GUg';


exports.handler = async function(req, res, firestoreDb, admin, zoomHelper, taskHandler) {
    //console.log(`${req.headers}: ${JSON.stringify(req.headers)}`);s
    if (req.headers.authorization !== zoomVerificationToken) {
        return res.status(400).end();
    }

    const event = req.body.event
    const payload = req.body.payload

    switch (event) {
        case 'meeting.started':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const host_id = payload.object.host_id
                const id = payload.object.id
                try {
                    const {userMap, jobMap} = await zoomHelper.dataFromZoomMap(host_id, id, firestoreDb)
                    const when = admin.firestore.Timestamp.fromDate(new Date(payload.object.start_time))
                    await addMeetingEvent(userMap.uid, jobMap.id, event, when, payload, firestoreDb)
                    await handleMeetingStarted(userMap.uid, jobMap.id, firestoreDb)
                } catch (error) {
                    console.error(error)
                    return res.status(400).end();
                }                
            }
            break;
        case 'meeting.ended':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const host_id = payload.object.host_id
                const id = payload.object.id
                try {
                    const {userMap, jobMap} = await zoomHelper.dataFromZoomMap(host_id, id, firestoreDb)
                    const when = admin.firestore.Timestamp.fromDate(new Date(payload.object.end_time))
                    await addMeetingEvent(userMap.uid, jobMap.id, event, when, payload, firestoreDb)
                    await handleMeetingEnded(userMap.uid, jobMap.id, taskHandler, firestoreDb, admin)                    
                } catch (error) {
                    console.error(error)
                    return res.status(400).end();
                }
            }
            break;
        case 'meeting.participant_joined':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const host_id = payload.object.host_id
                const id = payload.object.id
                try {
                    const {userMap, jobMap} = await zoomHelper.dataFromZoomMap(host_id, id, firestoreDb)
                    const when = admin.firestore.Timestamp.fromDate(new Date(payload.object.participant.join_time))
                    await addMeetingEvent(userMap.uid, jobMap.id, event, when, payload, firestoreDb)
                } catch (error) {
                    console.error(error)
                    return res.status(400).end();
                }
            }
            break;
        case 'meeting.participant_left':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const host_id = payload.object.host_id
                const id = payload.object.id
                try {
                    const {userMap, jobMap} = await zoomHelper.dataFromZoomMap(host_id, id, firestoreDb)
                    const when = admin.firestore.Timestamp.fromDate(new Date(payload.object.participant.leave_time))
                    await addMeetingEvent(userMap.uid, jobMap.id, event, when, payload, firestoreDb)
                } catch (error) {
                    console.error(error)
                    return res.status(400).end();
                }
            }
            break;
        default:
            // Unexpected event type
            return res.status(400).end();
    }

    // Return a response to acknowledge receipt of the event
    return res.sendStatus(200)
    
}


const handleMeetingStarted = async (uid, jobId, firestoreDb) => {
    try {
        const status = await getJobStatus(uid, jobId, firestoreDb)
        if (status === 'pending' || status === 'authorized') {
            await firestoreDb.collection('/users')
            .doc(uid)
            .collection('meetings')
            .doc(jobId)
            .set({
                status: 'started'
            }, { merge: true })    
        }
        
        return true
    } catch (error) {
        console.error(error);
        console.log(`handleMeetingStarted Error: ${JSON.stringify(error)}`)
        throw error
    }    
}


const handleMeetingEnded = async (uid, jobId, taskHandler, firestoreDb, admin) => {
    try {
        const status = await getJobStatus(uid, jobId, firestoreDb)

        if (status === 'pending' || 
            status === 'authorized' ||
            status === 'started' ) {    
                await taskHandler.cancelMeetingCompletedTasks(uid, jobId, firestoreDb)

                const timeNow = admin.firestore.Timestamp.fromDate(new Date())
                await taskHandler.scheduleCompletionForJob(uid, jobId, timeNow, firestoreDb)
        }
        
        return true
    } catch (error) {
        console.error(error);
        console.log(`handleMeetingEnded Error: ${JSON.stringify(error)}`)
        throw error
    }    
}


const getJobStatus = async (uid, jobId, firestoreDb) => {
    try {
        const jobSnap = await firestoreDb.collection('/users')
        .doc(uid)
        .collection('meetings')
        .doc(jobId)
        .get()

        return jobSnap.data().status
    } catch (error) {
        console.error(error);
        console.log(`getJobStatus Error: ${JSON.stringify(error)}`)
        throw error
    }    
}


const addMeetingEvent = async (uid, id, type, when, payload, firestoreDb) => {
    try {
        var eventDoc = {
            type: type,
            when: when,
        }

        if ('participant' in payload.object) {
            eventDoc.participant = payload.object.participant
        }

        await firestoreDb.collection('/billing')
        .doc(uid)
        .collection('meetings')
        .doc(id)
        .collection("events")
        .add(eventDoc);

        return true

    } catch (error) {
        console.error(error);
        console.log(`addMeetingEvent Error: ${JSON.stringify(error)}`)
        throw error
    }

}