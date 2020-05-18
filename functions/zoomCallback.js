const functions = require('firebase-functions');
const zoomVerificationToken = 'ZLXFn9VjQS2cHoG_y0_GUg';


exports.handler = async function(req, res, firestoreDb, admin) {
    //console.log(`${req.headers}: ${JSON.stringify(req.headers)}`);
    if (req.headers.authorization !== zoomVerificationToken) {
        return res.status(400).end();
    }

    switch (req.body.event) {
        case 'meeting.started':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const {userDoc, jobDoc} = await getMeetingRef(req.body.payload, firestoreDb)
                console.log(`uid: ${userDoc.uid}`)
                console.log(`id: ${jobDoc.id}`)
                await addMeetingEvent(userDoc.uid, jobDoc.id, req.body.event, req.body.payload, firestoreDb, admin)
            }
            break;
        case 'meeting.ended':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const {userDoc, jobDoc} = await getMeetingRef(req.body.payload, firestoreDb)
                console.log(`uid: ${userDoc.uid}`)
                console.log(`id: ${jobDoc.id}`)
                await addMeetingEvent(userDoc.uid, jobDoc.id, req.body.event, req.body.payload, firestoreDb, admin)
                // enqueue billing revenue capture
            }
            break;
        case 'meeting.participant_joined':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const {userDoc, jobDoc} = await getMeetingRef(req.body.payload, firestoreDb)
                console.log(`uid: ${userDoc.uid}`)
                console.log(`id: ${jobDoc.id}`)
                await addMeetingEvent(userDoc.uid, jobDoc.id, req.body.event, req.body.payload, firestoreDb, admin)
            }
            break;
        case 'meeting.participant_left':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
                const {userDoc, jobDoc} = await getMeetingRef(req.body.payload, firestoreDb)
                console.log(`uid: ${userDoc.uid}`)
                console.log(`id: ${jobDoc.id}`)
                await addMeetingEvent(userDoc.uid, jobDoc.id, req.body.event, req.body.payload, firestoreDb, admin)
            }
            break;
        default:
            // Unexpected event type
            return res.status(400).end();
    }

    // Return a response to acknowledge receipt of the event
    return res.json({received: true});
    
}


const getMeetingRef = async (payload, firestoreDb) => {
    
    try {

        const [
            userSnap,
            jobSnap,
        ] = await Promise.all([
            firestoreDb.collection('/zoom_map')
                .doc(payload.object.host_id)
                .get(),
            firestoreDb.collection('/zoom_map')
                .doc(payload.object.host_id)
                .collection('meetings')
                .doc(payload.object.id)
                .get(),
        ])

        // check for empty documents
        if (!userSnap.exists) {
            console.log('No such user!')
            return false
        }
        if (!jobSnap.exists) {
            console.log('No such job!') 
            return false
        }

        return {
            userDoc: userSnap.data(),
            jobDoc: jobSnap.data(),
        }

    } catch (error) {
        console.error(error);
        return false
    }

}


const addMeetingEvent = async (uid, id, type, payload, firestoreDb, admin) => {
    try {
        var eventDoc = {
            type: type,
            t: admin.firestore.Timestamp.fromDate(new Date())
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
        return false
    }

}