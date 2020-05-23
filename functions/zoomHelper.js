const moment = require('moment');


const dataFromZoomMap = async (host_id, meeting_id, firestoreDb) => {
    
    try {

        const [
            userSnap,
            jobSnap,
        ] = await Promise.all([
            firestoreDb.collection('/zoom_map')
                .doc(host_id)
                .get(),
            firestoreDb.collection('/zoom_map')
                .doc(host_id)
                .collection('meetings')
                .doc(meeting_id)
                .get(),
        ])

        // check for empty documents
        if (!userSnap.exists) {
            throw new Error(`No such user: ${host_id}`)
        }
        if (!jobSnap.exists) {
            throw new Error(`No such job: ${meeting_id}`)
        }

        return {
            userDoc: userSnap.data(),
            jobDoc: jobSnap.data(),
        }

    } catch (error) {
        throw error
    }

}


const removeZoomMap = async (zoomUserId, jobDoc, firestoreDb) => {
    try {
        await firestoreDb.collection('/zoom_map')
        .doc(zoomUserId)
        .collection('meetings')
        .doc(jobDoc.id)
        .delete();

        return true
        
    } catch (error) {
        throw error
    }
}


module.exports = {
    dataFromZoomMap,
    removeZoomMap
}