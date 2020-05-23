const functions = require('firebase-functions');
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
                    const {userDoc, jobDoc} = await zoomHelper.dataFromZoomMap(host_id, id, firestoreDb)
                    const when = admin.firestore.Timestamp.fromDate(new Date(payload.object.start_time))
                    await addMeetingEvent(userDoc.uid, jobDoc.id, event, when, payload, firestoreDb)
                    await handleMeetingStarted(userDoc.uid, jobDoc.id, firestoreDb)
                } catch (error) {
                    console.error(error)
                }                
            }
            break;
        case 'meeting.ended':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const host_id = payload.object.host_id
                const id = payload.object.id
                try {
                    const {userDoc, jobDoc} = await zoomHelper.dataFromZoomMap(host_id, id, firestoreDb)
                    const when = admin.firestore.Timestamp.fromDate(new Date(payload.object.end_time))
                    await addMeetingEvent(userDoc.uid, jobDoc.id, event, when, payload, firestoreDb)
                    await taskHandler.scheduleBillingForJob(userDoc.uid, jobDoc.id, when, firestoreDb)
                } catch (error) {
                    console.error(error)
                }
            }
            break;
        case 'meeting.participant_joined':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const host_id = payload.object.host_id
                const id = payload.object.id
                try {
                    const {userDoc, jobDoc} = await zoomHelper.dataFromZoomMap(host_id, id, firestoreDb)
                    const when = admin.firestore.Timestamp.fromDate(new Date(payload.object.participant.join_time))
                    await addMeetingEvent(userDoc.uid, jobDoc.id, event, when, payload, firestoreDb)
                } catch (error) {
                    console.error(error)
                }
            }
            break;
        case 'meeting.participant_left':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const host_id = payload.object.host_id
                const id = payload.object.id
                try {
                    const {userDoc, jobDoc} = await zoomHelper.dataFromZoomMap(host_id, id, firestoreDb)
                    const when = admin.firestore.Timestamp.fromDate(new Date(payload.object.participant.leave_time))
                    await addMeetingEvent(userDoc.uid, jobDoc.id, event, when, payload, firestoreDb)
                } catch (error) {
                    console.error(error)
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
        await firestoreDb.collection('/users')
        .doc(uid)
        .collection('meetings')
        .doc(jobId)
        .set({
            status: 'started'
        }, { merge: true })
        
        return true
    } catch (error) {
        console.error(error);
        console.log(`handleMeetingStarted Error: ${JSON.stringify(error)}`)
        return false
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
        throw error
    }

}